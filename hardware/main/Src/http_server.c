#include "esp_http_server.h"
#include "esp_http_server.h"
#include "esp_log.h"
#include <stdio.h>

// extern'd from posture_task
extern float g_last_tilt;
static const char *TAG = "http_server";

static esp_err_t posture_get_handler(httpd_req_t *req) {
    char buf[64];
    int len = snprintf(buf, sizeof(buf),
        "{\"angle\":%.2f}", g_last_tilt
    );
    httpd_resp_set_type(req, "application/json");
    httpd_resp_send(req, buf, len);
    return ESP_OK;
}

static const httpd_uri_t posture_uri = {
    .uri       = "/posture",
    .method    = HTTP_GET,
    .handler   = posture_get_handler,
    .user_ctx  = NULL
};

esp_err_t start_posture_http_server(void) {
    httpd_handle_t server = NULL;
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();

    ESP_LOGI(TAG, "Starting HTTP server");
    if (httpd_start(&server, &config) != ESP_OK) {
        ESP_LOGE(TAG, "Failed to start server");
        return ESP_FAIL;
    }
    httpd_register_uri_handler(server, &posture_uri);
    return ESP_OK;
}
