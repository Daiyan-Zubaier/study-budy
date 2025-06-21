#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"

#include "mpu6050.h"
#include "driver/gpio.h"
#include "wifi_manager.h"
#include "http_server.h"
#include <math.h>

#define MOTOR_PIN      GPIO_NUM_17
#define THRESH_ANGLE   20.0f
#define MAX_COUNT      50

static const char *TAG = "study_buddy";

// global for HTTP handler
float g_last_tilt = 0.0f;

void posture_task(void *pv) {
    gpio_reset_pin(MOTOR_PIN);
    gpio_set_direction(MOTOR_PIN, GPIO_MODE_OUTPUT);

    int bad_count = 0;
    while (1) {
        float angle;
        if (mpu6050_read_tilt(&angle) == ESP_OK) {
            g_last_tilt = angle;
            ESP_LOGI(TAG, "Tilt angle: %.2f°", angle);

            bool is_bad = fabsf(angle) > THRESH_ANGLE;
            bad_count = is_bad ? bad_count + 1 : 0;
            gpio_set_level(MOTOR_PIN, (bad_count >= MAX_COUNT));
        } else {
            ESP_LOGE(TAG, "MPU read failed");
        }
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

void app_main(void) {
    ESP_ERROR_CHECK(mpu6050_init());
    wifi_manager_init();

    // start HTTP server once we have Wi‑Fi
    start_posture_http_server();

    // also spawn posture sampling locally
    xTaskCreate(posture_task,
                "posture_task",
                4096, NULL, 5, NULL);
}
