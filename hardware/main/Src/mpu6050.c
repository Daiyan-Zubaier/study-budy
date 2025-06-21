// mpu6050.c
#include "mpu6050.h"
#include "driver/i2c.h"
#include "esp_log.h"
#include <math.h>

static const char *TAG = "MPU6050";

static esp_err_t i2c_master_init(void) {
    i2c_config_t cfg = {
        .mode           = I2C_MODE_MASTER,
        .sda_io_num     = GPIO_NUM_21,
        .scl_io_num     = GPIO_NUM_22,
        .master.clk_speed    = 400000,
        .sda_pullup_en  = GPIO_PULLUP_ENABLE,
        .scl_pullup_en  = GPIO_PULLUP_ENABLE,
    };

    esp_err_t err = i2c_param_config(MPU6050_I2C_NUM, &cfg);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "i2c_param_config failed: %s", esp_err_to_name(err));
        return err;
    }

    err = i2c_driver_install(MPU6050_I2C_NUM, cfg.mode, 0, 0, 0);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "i2c_driver_install failed: %s", esp_err_to_name(err));
        return err;
    }

    return ESP_OK;
}

esp_err_t mpu6050_init(void) {
    ESP_LOGI(TAG, "Starting MPU6050 init");

    esp_err_t err = i2c_master_init();
    if (err != ESP_OK) return err;

    // 1) Ping the device
    for (int i = 0; i < 5; i++) {
        uint8_t reg = REG_PWR_MGMT1;
        err = i2c_master_write_to_device(
            MPU6050_I2C_NUM, MPU6050_ADDR,
            &reg, 1, 100 / portTICK_PERIOD_MS
        );
        if (err == ESP_OK) break;
        vTaskDelay(100 / portTICK_PERIOD_MS);
    }
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Device not responding: %s", esp_err_to_name(err));
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
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Writing gyro FS failed: %s", esp_err_to_name(err));
        return err;
    }

    // 3) Configure accel full‑scale
    val = FS_ACCEL_2G;
    err = i2c_master_write_to_device(
        MPU6050_I2C_NUM, MPU6050_ADDR,
        (uint8_t[]){ REG_CONFIG_ACCEL, val }, 2,
        100 / portTICK_PERIOD_MS
    );
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Writing accel FS failed: %s", esp_err_to_name(err));
        return err;
    }

    // 4) Exit sleep mode (clear PWR_MGMT1)
    val = 0x00;
    err = i2c_master_write_to_device(
        MPU6050_I2C_NUM, MPU6050_ADDR,
        (uint8_t[]){ REG_PWR_MGMT1, val }, 2,
        100 / portTICK_PERIOD_MS
    );
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Exiting sleep failed: %s", esp_err_to_name(err));
        return err;
    }

    // 5) Disable USER_CTRL
    val = 0x00;
    err = i2c_master_write_to_device(
        MPU6050_I2C_NUM, MPU6050_ADDR,
        (uint8_t[]){ REG_USER_CTRL, val }, 2,
        100 / portTICK_PERIOD_MS
    );
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Writing USER_CTRL failed: %s", esp_err_to_name(err));
        return err;
    }

    ESP_LOGI(TAG, "MPU6050 initialization complete");
    return ESP_OK;
}

esp_err_t mpu6050_read_tilt(float *out_angle_deg) {
    // 1‑byte register address followed immediately by a 6‑byte read
    uint8_t reg = REG_ACCEL_XOUT_H;
    uint8_t buf[6];
    esp_err_t err = i2c_master_write_read_device(
        MPU6050_I2C_NUM,
        MPU6050_ADDR,
        &reg, 1,      // write the accel‑X high‑byte register address
        buf, 6,       // then read 6 bytes: XH, XL, YH, YL, ZH, ZL
        100 / portTICK_PERIOD_MS
    );
    if (err != ESP_OK) {
        ESP_LOGE("MPU6050", "I2C read failed: %s", esp_err_to_name(err));
        return err;
    }

    // assemble raw readings
    int16_t ax = (buf[0] << 8) | buf[1];
    int16_t ay = (buf[2] << 8) | buf[3];
    int16_t az = (buf[4] << 8) | buf[5];

    // convert to g’s (±2g range)
    float fx = ax / 16384.0f;
    float fy = ay / 16384.0f;
    float fz = az / 16384.0f;

    // angle from vertical: atan2(√(x²+y²), z)
    *out_angle_deg = atan2f(sqrtf(fx*fx + fy*fy), fz) * 180.0f / M_PI;
    return ESP_OK;
}
