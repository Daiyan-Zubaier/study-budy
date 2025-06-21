#pragma once

/**
 * @brief   Bootstraps Wi‑Fi in station mode, reconnects on drop,
 *          and when an IP is obtained it will launch your
 *          posture_task().
 */
void wifi_manager_init(void);
