// mpu6050.h
#pragma once

#include "esp_err.h"
#include "driver/i2c.h"

#define MPU6050_I2C_NUM      I2C_NUM_0
#define MPU6050_ADDR         0x68

// Registers
#define REG_PWR_MGMT1        0x6B
#define REG_CONFIG_GYRO      27
#define REG_CONFIG_ACCEL     28
#define REG_USER_CTRL        107
#define REG_ACCEL_XOUT_H     0x3B

// Full‑scale settings
#define FS_GYRO_250          0x00
#define FS_GYRO_500          0x08
#define FS_GYRO_1000         0x10
#define FS_GYRO_2000         0x18

#define FS_ACCEL_2G          0x00
#define FS_ACCEL_4G          0x08
#define FS_ACCEL_8G          0x10
#define FS_ACCEL_16G         0x18

/** Initialize I2C and configure the MPU6050. */
esp_err_t mpu6050_init(void);

/**
 * Read accelerometer, compute tilt (degrees from vertical).
 * @param out_angle_deg  pointer to float to receive angle
 */
esp_err_t mpu6050_read_tilt(float *out_angle_deg);
