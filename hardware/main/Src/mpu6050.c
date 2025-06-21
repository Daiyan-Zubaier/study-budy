#include "mpu6050.h"
#include "driver/i2c.h"
#include <math.h>

#define I2C_MASTER_NUM         I2C_NUM_0
#define I2C_MASTER_SDA_IO      21
#define I2C_MASTER_SCL_IO      22
#define I2C_MASTER_FREQ_HZ     400000
#define MPU6050_ADDR           0x68
#define REG_PWR_MGMT1          0x6B
#define REG_ACCEL_XOUT_H       0x3B

static esp_err_t i2c_master_init(void) {
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    esp_err_t err = i2c_param_config(I2C_MASTER_NUM, &conf);
    if (err != ESP_OK) return err;
    return i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

esp_err_t mpu6050_init(void) {
    esp_err_t err = i2c_master_init();
    if (err != ESP_OK) return err;
    // Wake up MPU6050
    uint8_t cmd[] = { REG_PWR_MGMT1, 0x00 };
    return i2c_master_write_to_device(I2C_MASTER_NUM, MPU6050_ADDR,
                                       cmd, sizeof(cmd), 1000/portTICK_PERIOD_MS);
}

esp_err_t mpu6050_get_tilt(float *out_angle_deg) {
    uint8_t data[6];
    // Read ACCEL_XOUT_H (6 bytes: XH, XL, YH, YL, ZH, ZL)
    esp_err_t err = i2c_master_read_from_device(
        I2C_MASTER_NUM, MPU6050_ADDR,
        data, sizeof(data),
        1000/portTICK_PERIOD_MS);
    if (err != ESP_OK) return err;

    int16_t ax = (data[0]<<8) | data[1];
    int16_t ay = (data[2]<<8) | data[3];
    int16_t az = (data[4]<<8) | data[5];
    // Convert to g’s (±2g range → 16384 LSB/g)
    float fx = ax / 16384.0f;
    float fz = az / 16384.0f;
    // Tilt around Y‑axis: angle = atan2(X, Z)
    *out_angle_deg = atan2f(fx, fz) * 180.0f / M_PI;
    return ESP_OK;
}
