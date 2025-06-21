// mpu6050.c
#include "mpu6050.h"
#include "driver/i2c.h"
#include "esp_log.h"
#include <math.h>

static const char *TAG = "MPU6050";

static esp_err_t i2c_master_init(void) {
    i2c_config_t cfg = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = GPIO_NUM_21,
        .scl_io_num = GPIO_NUM_22,
        .master.clk_speed = 400000,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
    };
    ESP_RET_ON_ERROR(i2c_param_config(MPU6050_I2C_NUM, &cfg), TAG, "cfg failed");
    ESP_RET_ON_ERROR(i2c_driver_install(MPU6050_I2C_NUM, cfg.mode, 0, 0, 0),
                    TAG, "driver install failed");
    return ESP_OK;
}

esp_err_t mpu6050_init(void) {
    ESP_LOGI(TAG, "Starting MPU6050 init");
    esp_err_t err = i2c_master_init();
    if (err != ESP_OK) return err;

    // 1) Ping the device
    for (int i = 0; i < 5; i++) {
        err = i2c_master_write_to_device(
            MPU6050_I2C_NUM, MPU6050_ADDR,
            (uint8_t[]){ REG_PWR_MGMT1 }, 1,
            100 / portTICK_PERIOD_MS
        );
        if (err == ESP_OK) break;
        vTaskDelay(100 / portTICK_PERIOD_MS);
    }
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Device not responding");
        return err;
    }
    ESP_LOGI(TAG, "Device is ready");

    // 2) Configure gyro full‑scale
    uint8_t val = FS_GYRO_500;
    err = i2c_master_write_to_device(
        MPU6050_I2C_NUM, MPU6050_ADDR,
        (uint8_t[]){ REG_CONFIG_GYRO, val }, 2,
        100 / portTICK_PERIOD_MS
    );
    ESP_RET_ON_ERROR(err, TAG, "failed writing gyro FS");

    // 3) Configure accel full‑scale
    val = FS_ACCEL_2G;
    err = i2c_master_write_to_device(
        MPU6050_I2C_NUM, MPU6050_ADDR,
        (uint8_t[]){ REG_CONFIG_ACCEL, val }, 2,
        100 / portTICK_PERIOD_MS
    );
    ESP_RET_ON_ERROR(err, TAG, "failed writing accel FS");

    // 4) Exit sleep mode (clear PWR_MGMT1)
    val = 0x00;
    err = i2c_master_write_to_device(
        MPU6050_I2C_NUM, MPU6050_ADDR,
        (uint8_t[]){ REG_PWR_MGMT1, val }, 2,
        100 / portTICK_PERIOD_MS
    );
    ESP_RET_ON_ERROR(err, TAG, "failed exiting sleep");

    // 5) Disable FIFO/user control if needed
    val = 0x00;
    err = i2c_master_write_to_device(
        MPU6050_I2C_NUM, MPU6050_ADDR,
        (uint8_t[]){ REG_USER_CTRL, val }, 2,
        100 / portTICK_PERIOD_MS
    );
    ESP_RET_ON_ERROR(err, TAG, "failed writing USER_CTRL");

    ESP_LOGI(TAG, "MPU6050 initialization complete");
    return ESP_OK;
}

esp_err_t mpu6050_read_tilt(float *out_angle_deg) {
    uint8_t buf[6];
    esp_err_t err = i2c_master_read_from_device(
        MPU6050_I2C_NUM, MPU6050_ADDR,
        buf, sizeof(buf),
        100 / portTICK_PERIOD_MS
    );
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Accel read failed: %s", esp_err_to_name(err));
        return err;
    }

    int16_t ax = (buf[0] << 8) | buf[1];
    int16_t ay = (buf[2] << 8) | buf[3];
    int16_t az = (buf[4] << 8) | buf[5];

    float fx = ax / 16384.0f;
    float fy = ay / 16384.0f;
    float fz = az / 16384.0f;

    // angle from vertical: atan2(sqrt(x²+y²), z)
    *out_angle_deg = atan2f(sqrtf(fx*fx + fy*fy), fz) * 180.0f / M_PI;
    return ESP_OK;
}
