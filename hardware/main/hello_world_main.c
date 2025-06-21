#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "esp_netif.h"
#include "esp_event.h"
#include "esp_wifi.h"
#include "esp_http_client.h"
#include "mpu6050.h"
#include "driver/gpio.h"

#define WIFI_SSID      "your_SSID"
#define WIFI_PASS      "your_PASSWORD"
#define MOTOR_PIN      GPIO_NUM_18
#define THRESH_ANGLE   20.0f
#define MAX_COUNT      50
#define SERVER_BASEURL "https://<your-vercel>.vercel.app/api/posture"

static const char *TAG = "study_buddy";

static void wifi_event_handler(void* arg, esp_event_base_t base,
                               int32_t id, void* data) {
    if (id == WIFI_EVENT_STA_START) {
        esp_wifi_connect();
    } else if (id == WIFI_EVENT_STA_DISCONNECTED) {
        ESP_LOGW(TAG, "Wi‑Fi lost, reconnecting…");
        esp_wifi_connect();
    } else if (id == IP_EVENT_STA_GOT_IP) {
        ESP_LOGI(TAG, "Got IP address; launching posture task");
        xTaskCreatePinnedToCore(
            posture_task, "posture", 8192, NULL, 5, NULL, tskNO_AFFINITY);
    }
}

void wifi_init(void) {
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    ESP_ERROR_CHECK(esp_event_handler_register(
        WIFI_EVENT, ESP_EVENT_ANY_ID, wifi_event_handler, NULL));
    ESP_ERROR_CHECK(esp_event_handler_register(
        IP_EVENT, IP_EVENT_STA_GOT_IP, wifi_event_handler, NULL));
    wifi_config_t wcfg = {
        .sta = {
            .ssid = WIFI_SSID,
            .password = WIFI_PASS,
        },
    };
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wcfg));
    ESP_ERROR_CHECK(esp_wifi_start());
    ESP_LOGI(TAG, "Wi‑Fi init done");
}

void posture_task(void *pv) {
    // motor pin
    gpio_reset_pin(MOTOR_PIN);
    gpio_set_direction(MOTOR_PIN, GPIO_MODE_OUTPUT);
    int bad_count = 0;

    while (1) {
        float angle;
        if (mpu6050_get_tilt(&angle) != ESP_OK) {
            ESP_LOGE(TAG, "MPU read failed");
            vTaskDelay(1000/portTICK_PERIOD_MS);
            continue;
        }
        bool is_bad = fabsf(angle) > THRESH_ANGLE;
        bad_count = is_bad ? bad_count + 1 : 0;
        gpio_set_level(MOTOR_PIN, (bad_count >= MAX_COUNT));

        // build URL with query params
        char url[128];
        snprintf(url, sizeof(url),
                 "%s?angle=%.1f&status=%s",
                 SERVER_BASEURL,
                 angle,
                 is_bad ? "bad" : "good");

        // do HTTP GET
        esp_http_client_config_t cfg = {
            .url    = url,
            .method = HTTP_METHOD_GET,
        };
        esp_http_client_handle_t client = esp_http_client_init(&cfg);
        esp_err_t err = esp_http_client_perform(client);
        if (err == ESP_OK) {
            ESP_LOGI(TAG, "GET %s → %d",
                     url,
                     esp_http_client_get_status_code(client));
        } else {
            ESP_LOGE(TAG, "HTTP GET failed: %s", esp_err_to_name(err));
        }
        esp_http_client_cleanup(client);

        vTaskDelay(1000/portTICK_PERIOD_MS);
    }
}

void app_main(void) {
    ESP_ERROR_CHECK(mpu6050_init());
    wifi_init();
}
