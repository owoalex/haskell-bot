var config = {};

config["botUsername"] = "ghci";
config["botUserId"] = 768868452995170315;
config["keys"] = "keys.json";
config["debugLevel"] = 3; // 0 for nothing but an exceptional error // 1 for all errors // 2 for infrequent events & errors // 3 for all debug info
config["triggerSuffix"] = null;
config["triggerPrefix"] = "ghci";
config["triggerPrefixEval"] = "$";
config["maxExecutionTime"] = 3000;
config["maxInteractiveTime"] = 10 * 60 * 1000;
config["experimentalFeatureLevel"] = 2;
module.exports = config;
