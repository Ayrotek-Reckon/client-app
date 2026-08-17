/**
 * Endpoint map kept in sync with the actual APISIX routes and backend controllers
 * (see each service's controller classes for the source of truth).
 *
 * NOTE: /api/v1/users has no backend implementation yet — user-service only
 * contains a bootstrap Application class, no controller, entity or repository.
 * The user-management feature will fail against real infra until that service
 * is implemented and registered with APISIX.
 *
 * NOTE: There is no dashboard-service. Dashboard data is aggregated client-side
 * from the nodes and hiveos endpoints below.
 */
export const API_CONFIG = {
  apiUrl: 'http://192.168.1.34:9080/api/v1',
  tokenKey: 'reckon_access_token',
  refreshTokenKey: 'reckon_refresh_token',
  userKey: 'reckon_user',

  endpoints: {
    // Auth endpoints — auth-service (AuthController)
    login: '/auth/login',
    register: '/auth/register',
    refreshToken: '/auth/refresh',
    logout: '/auth/logout',

    // User endpoints — NOT YET IMPLEMENTED on the backend (user-service is empty)
    users: '/users',

    // Node / GPU monitoring endpoints — gpu-monitoring-service (NodeController)
    nodes: '/nodes',

    // HiveOS endpoints — hiveos-integration (HiveosController, MiningController)
    hiveosFarms: '/hiveos/farms',
    hiveosPools: '/hiveos/pools',

    // Strategy-builder discovery catalogs — MiningController (proxied from HiveOS /hive/*)
    hiveosCoins: '/hiveos/coins',
    hiveosMiners: '/hiveos/miners',
    hiveosAlgos: '/hiveos/algos',

    // Reusable mining strategies — MiningStrategyController (persisted, per-user)
    hiveosStrategies: '/hiveos/strategies'
  },

  defaultTimeout: 30000,
  maxRetries: 3
};
