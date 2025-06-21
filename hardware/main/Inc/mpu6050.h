#pragma once
#include "esp_err.h"

esp_err_t mpu6050_init(void);
esp_err_t mpu6050_get_tilt(float *out_angle_deg);