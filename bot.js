const Discord = require('discord.js');
const discordClientObject = new Discord.Client();
const httpRequest = require('got');
const fileSystem = require('fs');
const URL = require('url');
const path = require('path');
const haskell = require('haskell');
const childProcess = require('child_process');
const text2png = require('text2png');
var configFile = undefined;
var passedConfigFile = undefined;
process.argv.forEach(function (val, index, array) {
    if (index == array.length - 1) {
        passedConfigFile = val;
    }
});

try {
    try {
        try {
            configFile = require(passedConfigFile);
            if ((configFile["keys"] == undefined) || (configFile["keys"] == "")) {
                throw "No Api Key in passed config file";
            }
            console.log("[   INFO   ] Applying config file passed from cli [" + passedConfigFile + "]")
        } catch(ex) {
            configFile = require("./"+passedConfigFile);
            if ((configFile["keys"] == undefined) || (configFile["keys"] == "")) {
                console.log("[ WARNING  ] No Api Key in config file passed from cli [" + passedConfigFile + "]")
                throw "No Api Key in passed config file";
            }
            console.log("[   INFO   ] Applying config file passed from cli [./"+passedConfigFile + "]")
        }
    } catch(ex) {
        configFile = require('./config');
        if ((configFile["keys"] == undefined) || (configFile["keys"] == "")) {
            console.log("[ WARNING  ] No Api Key in config file from local directory")
            throw "No Api Key in passed config file";
        }
        console.log("[   INFO   ] Applying config file from local directory")
    }
} catch(ex) {
    console.log("[*CRITICAL*] NO VALID CONFIG FILE")
}
var discordApiKey = null;
var keyFile = null;
var keys = null;
var serverGlobVars = [];
var botUsername = null;
var botUserId = null;
var debugLevel = 3;
var triggerSuffix = null;
var triggerPrefix = null;
var triggerPrefixEval = null;
var experimentalFeatureLevel = 0;
var maxExecutionTime = 0;
var maxInteractiveTime = 0;
console.log("[   INFO   ] Initialising riamu-bot");
try{keyFile = configFile["keys"];if(keyFile == undefined){throw "notFound";};}catch(ex){console.log("[*CRITICAL*] NO API KEYS!")}
try{botUsername = configFile["botUsername"];if(botUsername == undefined){throw "notFound";};}catch(ex){console.log("[ WARNING  ] No username for bot, it may start talking to itself")}
try{botUserId = configFile["botUserId"];if(botUserId == undefined){throw "notFound";};}catch(ex){console.log("[ WARNING  ] No user id for bot, it may start talking to itself")}
try{debugLevel = configFile["debugLevel"];if(debugLevel == undefined){throw "notFound";};}catch(ex){console.log("[ WARNING  ] No debug level set, defaulting to max (you may get a lot of console clutter)");debugLevel = 3;}
try{triggerSuffix = configFile["triggerSuffix"];if(triggerSuffix == undefined){throw "notFound";};}catch(ex){console.log("[   INFO   ] No trigger suffix set, disabling");triggerSuffix = null;}
try{triggerPrefix = configFile["triggerPrefix"];if(triggerPrefix == undefined){throw "notFound";};}catch(ex){console.log("[   INFO   ] No trigger prefix set, disabling");triggerPrefix = null;}
try{triggerPrefixEval = configFile["triggerPrefixEval"];if(triggerPrefixEval == undefined){throw "notFound";};}catch(ex){console.log("[   INFO   ] No trigger eval prefix set, disabling");triggerPrefixEval = null;}
try{experimentalFeatureLevel = configFile["experimentalFeatureLevel"];if(experimentalFeatureLevel == undefined){throw "notFound";};}catch(ex){console.log("[   INFO   ] No experimental feature level set, defaulting to stable features");experimentalFeatureLevel = 0;}
try{maxExecutionTime = configFile["maxExecutionTime"];if(maxExecutionTime == undefined){throw "notFound";};}catch(ex){console.log("[   INFO   ] No max execution time");maxExecutionTime = -1;}
try{maxInteractiveTime = configFile["maxInteractiveTime"];if(maxInteractiveTime == undefined){throw "notFound";};}catch(ex){console.log("[   INFO   ] No max interactive time");maxInteractiveTime = -1;}

if (!keyFile.startsWith("/")) {
    keyFile = path.join(__dirname,keyFile);
}
console.log("[   INFO   ] keyFile = "+keyFile);
keys = JSON.parse(fileSystem.readFileSync(keyFile).toString());
console.log("[   INFO   ] keyData = ");
console.log(JSON.stringify(keys));
try{discordApiKey = keys["discordApiKey"];if(discordApiKey == undefined){throw "notFound";};}catch(ex){console.log("[*CRITICAL*] NO DISCORD API KEY!")}
console.log("[   INFO   ] discordApiKey = "+discordApiKey);
console.log("[   INFO   ] botUsername = "+botUsername);
console.log("[   INFO   ] botUserId = "+botUserId);
console.log("[   INFO   ] debugLevel = "+debugLevel);
console.log("[   INFO   ] triggerSuffix = "+triggerSuffix);
console.log("[   INFO   ] triggerPrefix = "+triggerPrefix);
console.log("[   INFO   ] experimentalFeatureLevell = "+experimentalFeatureLevel);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

discordClientObject.on('ready', function (evt) {
    try{
        console.log('[   INFO   ] Connected to Discord servers');
    } catch(ex) {
        if (debugLevel > 0){console.log("[  ERROR   ] " + ex);}
    }
});
discordClientObject.on('error', er => {
    try{
        if (debugLevel > 0){console.log("[  ERROR   ] " + er);}
    } catch(ex) {
        if (debugLevel > 0){console.log("[  ERROR   ] " + ex);}
    }
});
discordClientObject.on('ratelimit', function (ret) {
    try{
        console.log('[   INFO   ] Rate limiting detected: '+ret);
    } catch(ex) {
        if (debugLevel > 0){console.log("[  ERROR   ] " + ex);}
    }
});
discordClientObject.on('guildMemberAdd', member => {
    try{
        const channel = member.guild.channels.find('name', 'member-log');
        if (!channel) return;
        channel.send("Welcome to the server, "+member);
    } catch(ex) {
        if (debugLevel > 0){console.log("[  ERROR   ] " + ex);}
    }
});
discordClientObject.on("disconnect", event => {
	if (debugLevel > 1){console.log("[   INFO   ] Disconnected: " + event.reason + " (" + event.code + ")");}
})

/**
discordClientObject.on('messageReactionAdd', (reaction, user) => {
    try{
        if (user.id != botUserId) {
            var serverId = undefined;
            //console.log(message.guild.name)
            var foundServer = false;
            for (i=0;i<serverGlobVars.length;i++) {
                if (serverGlobVars[i]["server"] == reaction.message.guild) {
                    foundServer = true;
                    serverId = i;
                }
            }

            if (foundServer) {
                if (permissionState(user.id,serverId,"music","skip")){
                    if (serverGlobVars[serverId]["lastQueue"].id == reaction.message.id) {
                        var reactionEmoji = reaction.emoji.name;

                        switch(reactionEmoji) {
                            case "\u23EE":
                                if (debugLevel > 2){console.log("[   INFO   ] Button: PrevTrack");};
                                commands.skipBack(null,reaction.message.channel,user.id,serverId);
                                break;
                            case "\u23ED":
                                if (debugLevel > 2){console.log("[   INFO   ] Button: SkipForward");};
                                commands.skipAhead(null,reaction.message.channel,user.id,serverId);
                                break;
                            case "\u23EA":
                                if (debugLevel > 2){console.log("[   INFO   ] Button: ScrubBack");};
                                break;
                            case "\u23EF":
                                if (debugLevel > 2){console.log("[   INFO   ] Button: PlayPause");};
                                break;//FE0F
                            case "\u23E9":
                                if (debugLevel > 2){console.log("[   INFO   ] Button: ScrubForward");};
                                break;//FE0F
                            case "\u{1F500}":
                                if (debugLevel > 2){console.log("[   INFO   ] Button: Shuffle");};
                                commands.shuffle(null,reaction.message.channel,user.id,serverId);
                                break;//FE0F
                            case "\u{1F501}":
                                if (debugLevel > 2){console.log("[   INFO   ] Button: Loop");};
                                commands.loop(null,reaction.message.channel,user.id,serverId);
                                break;//FE0F
                        }

                        reaction.remove(user).then(reaction => {
                            if (debugLevel > 2){console.log("[   INFO   ] Removed reaction from buttons");};
                    	});
                        //reaction.message.delete();
                        //displayQueue(serverId);
                    }
                } else {
                    serverGlobVars[serverId].messageChannel.send("You don't have the permission [music.skip] to do that ;-;");
                }
            }
            //if (reaction) {

            //}
        }
    } catch(ex) {
        if (debugLevel > 0){console.log("[  ERROR   ] " + ex);}
    };
});
*/

function commandsClass() {}
const commands = new commandsClass();

//returns trus if user has role
function getRoleStatus(message,roleName) {
    try {
        // message.member will be null for a DM, so check that the message is not a DM.
        if (!message.guild) message.channel.send('You must be in a guild.');

        // If the user has Role 1, remove it from them.
        let roleToMod = message.member.roles.find(role => role.name === roleName);
        if (roleToMod) {
            return true;
        } else {
            return false;
        }
        
    } catch(err) {
        // Log any errors.
        console.error(err);
    }
}

function makeLowerCase(value) {
  return value.toString().toLowerCase();
}

function sanitizeGHCIInput(haskellExpression,messageChannel) {
    if (haskellExpression.includes("writeFile")) {
        messageChannel.send("File IO is not permitted on the GHCI bot");
        throw("writeFile attempted");
    }
    if (haskellExpression.includes("appendFile")) {
        messageChannel.send("File IO is not permitted on the GHCI bot");
        throw("appendFile attempted");
    }
    if (haskellExpression.includes("readFile")) {
        messageChannel.send("File IO is not permitted on the GHCI bot");
        throw("readFile attempted");
    }
    if (haskellExpression.includes("readIO")) {
        messageChannel.send("File IO is not permitted on the GHCI bot");
        throw("readIO attempted");
    }
    if (haskellExpression.includes("readLn")) {
        messageChannel.send("File IO is not permitted on the GHCI bot");
        throw("readLn attempted");
    }
    if ( haskellExpression.startsWith(":") && (!haskellExpression.startsWith(":{")) && (!haskellExpression.startsWith(":}")) && (!haskellExpression.startsWith(":info")) && (!haskellExpression.startsWith(":type")) && (!haskellExpression.startsWith(":kind")) ) {
        messageChannel.send("GHCI commands apart from ( :type , :kind , :{ , :} , :info ) are not permitted on the GHCI bot");
        throw("GHCI : command attempted");
    }
    return haskellExpression;
}

discordClientObject.on('message', message => {
    try{
        let rawMessage = message.content;
        let serverId = null;
        let foundServer = false;
        for (i=0;i<serverGlobVars.length;i++) {
            if (serverGlobVars[i]["server"] == message.guild) {
                foundServer = true;
                serverId = i;
            }
        }
        if (foundServer == false) {
            let testRowIndex = serverGlobVars.push({
                "server":message.guild,
                "ghciProcesses":{},
                "interactiveSessions":[]
            }) - 1;
            for (i=0;i<serverGlobVars.length;i++) {
                if (serverGlobVars[i]["server"] == message.guild) {
                    serverId = i;
                }
            }
        }
        //console.log("[   INFO   ] serverId = " + serverId);
        serverGlobVars[serverId].messageChannel = message.channel;
        
        let interactiveSession = null;
        let interactiveSessionIndex = null;
        
        if (message.author.id != botUserId) {
            for (let i=0; i<serverGlobVars[serverId]["interactiveSessions"].length; i++) {
                if (serverGlobVars[serverId]["interactiveSessions"][i]["messageChannel"] == message.channel) {
                    console.log("Bound to interactive session!");
                    interactiveSession = serverGlobVars[serverId]["interactiveSessions"][i]["procId"];
                    interactiveSessionIndex = i;
                }
            }
        }
        
        if (interactiveSession != null) {
            if (rawMessage == ":q") {
                serverGlobVars[serverId]["ghciProcesses"][interactiveSession]["proc"].kill("SIGHUP");
                delete serverGlobVars[serverId]["ghciProcesses"][interactiveSession];
                serverGlobVars[serverId]["interactiveSessions"].splice(interactiveSessionIndex,1);
                message.channel.send("Ending interactive session");
            } else if (rawMessage.startsWith("> ") || rawMessage.startsWith("--")) {
                console.log("Ignoring careted chat");
            } else {
                serverGlobVars[serverId]["ghciProcesses"][interactiveSession]["proc"].stdin.write(sanitizeGHCIInput(rawMessage.replace("\n","") + "\n",message.channel));
                serverGlobVars[serverId]["ghciProcesses"][interactiveSession]["lastOutput"] = serverGlobVars[serverId]["ghciProcesses"][interactiveSession]["executionTime"];
                if (rawMessage.startsWith(":{")) {
                    serverGlobVars[serverId]["ghciProcesses"][interactiveSession]["multilineInput"] = true;
                }
                if (rawMessage.endsWith(":}")) {
                    serverGlobVars[serverId]["ghciProcesses"][interactiveSession]["multilineInput"] = false;
                }
                if (!serverGlobVars[serverId]["ghciProcesses"][interactiveSession]["multilineInput"]) {
                    serverGlobVars[serverId]["ghciProcesses"][interactiveSession]["idle"] = false;
                }
            }
        } else {
            if ((triggerPrefixEval != null) && rawMessage.startsWith(triggerPrefixEval)) {
                rawMessage = "ghci eval " + rawMessage.substring(1);
            }
            if (((triggerSuffix != null) && rawMessage.endsWith(triggerSuffix)) || ((triggerPrefix != null) && rawMessage.startsWith(triggerPrefix))) {
                if (message.author.id != botUserId) {
                    if (rawMessage.endsWith(triggerSuffix)){
                        rawMessage = rawMessage.substring(0, rawMessage.length - (triggerSuffix.length));
                    } else {
                        rawMessage = rawMessage.substring(triggerPrefix.length + 1, rawMessage.length);
                    }
                    let args = rawMessage.split(' ');
                    while (args.indexOf("") > -1) {
                        args.splice(args.indexOf(""),1);
                    }
                    let cmd = makeLowerCase(args[0]);
                    
                    args = args.splice(1);
                    switch(cmd) {
                        // !ping
                        case 'bruh':
                            message.channel.send("***bruh***");
                            break;
                        case 'debug':
                            var builtInsert = "Servers (" + serverGlobVars.length + ") :" + "\n";
                            for (i=0;i<serverGlobVars.length;i++) {
                                try{
                                    builtInsert = builtInsert + "    [" + i + "]" + serverGlobVars[i].server.name + "\n"
                                }catch(ex){}
                            }
                            builtInsert = builtInsert + "Current Server ID :" + serverId + "\n"
                            builtInsert = builtInsert + "Build Number :" + 3 + "\n"
                            serverGlobVars[serverId].messageChannel.send("```markdown\n" + builtInsert + "```");
                            break;
                        case 'type':
                        case 'kind':
                        case 'eval':
                            if (args.length > 0) {
                                try {
                                    //let haskellFunction = haskell(args.join(" "));
                                    //let haskellResponse = haskellFunction();
                                    let haskellProcessId = randomString(6, "aA#"); 
                                    let haskellExpression = sanitizeGHCIInput(args.join(" "),message.channel);
                                    if (cmd == "kind") {
                                        haskellExpression = ":kind " + haskellExpression
                                        //message.channel.send(haskellExpression);
                                    }
                                    if (cmd == "type") {
                                        haskellExpression = ":type " + haskellExpression
                                        //message.channel.send(haskellExpression);
                                    }
                                    //args.join(" ")
                                    serverGlobVars[serverId]["ghciProcesses"][haskellProcessId] = {
                                        "proc":childProcess.spawn("ghci",[],{"stdio":"pipe"}),
                                        "messageChannel":message.channel,
                                        "outputBuffer":"",
                                        "errorBuffer":"",
                                        "ready":false,
                                        "commandIssued":false,
                                        "outputGenerated":false,
                                        "idle":false,
                                        "exited":false,
                                        "interactive":false,
                                        "executionTime":0,
                                        "lastOutput":0,
                                        "multilineInput":false,
                                        "enqueuedMessages":[],
                                        "enqueuedErrors":[]
                                    }
                                    serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["proc"].stdout.on("data", (data) => {
                                        try {
                                            //console.log("GHCI " + serverId + ":" + haskellProcessId + " data=" + data);
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputBuffer"] += data;
                                            
                                            let outBuf = serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputBuffer"];
                                            
                                            do {
                                                if (outBuf.includes("\n")) {
                                                    //console.log(outBuf);
                                                    //message.channel.send(outBuf);
                                                    let lines = outBuf.split("\n");
                                                    //console.log("[srvprnt] " + lines[0]);
                                                    if (serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["commandIssued"] && (!serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputGenerated"])) {
                                                        let response = lines[0];
                                                        serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["enqueuedMessages"].push(response);
                                                        serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["lastOutput"] = serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["executionTime"];
                                                    }
                                                    lines.splice(0,1);
                                                    serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputBuffer"] = lines.join("\n");
                                                    outBuf = serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputBuffer"];
                                                }
                                                if (outBuf.endsWith("> ")) {
                                                    //console.log(outBuf);
                                                    let lines = outBuf.split("\n");
                                                    lines.splice(lines.length - 1,1);
                                                    serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["enqueuedMessages"].push(lines.join("\n"));
                                                    serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputBuffer"] = "";
                                                    //serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["proc"].stdin.write(":q");
                                                    if (serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["commandIssued"]) {
                                                        serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputGenerated"] = true;
                                                        serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["proc"].stdin.write(":q\n");
                                                    } else {
                                                        serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["proc"].stdin.write(haskellExpression + "\n");
                                                        serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["commandIssued"] = true;
                                                    }
                                                }
                                            } while (outBuf.includes("\n"));
                                        } catch(ex3) {
                                            if (debugLevel > 0){console.log("[ HASKELL  ] " + ex3);}
                                            if (debugLevel > 0){console.log(ex3.stack);}
                                        };
                                    });
                                    
                                    serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["proc"].stderr.on("data", (data) => {
                                        try {
                                            //console.log("GHCI " + serverId + ":" + haskellProcessId + " data=" + data);
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["errorBuffer"] += data;
                                        } catch(ex3) {
                                            if (debugLevel > 0){console.log("[ HASKELL  ] " + ex3);}
                                            if (debugLevel > 0){console.log(ex3.stack);}
                                        };
                                    });
                                    
                                    serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["proc"].on("exit", (code) => {
                                        try {
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["exited"] = true;
                                        } catch(ex3) {
                                            if (debugLevel > 0){console.log("[ HASKELL  ] " + ex3);}
                                            if (debugLevel > 0){console.log(ex3.stack);}
                                        };
                                    });
                                    
                                } catch(ex2) {
                                    if (debugLevel > 0){console.log("[ HASKELL  ] " + ex2);}
                                    if (debugLevel > 0){console.log(ex2.stack);}
                                };
                            } else {
                                message.channel.send("You need to provide an expression to evaluate!");
                            }
                            break;
                        case "interactive":
                            try {
                                //let haskellFunction = haskell(args.join(" "));
                                //let haskellResponse = haskellFunction();
                                //let haskellTempFile = "/tmp/ghciBot" + randomString(6, "aA#") + ".hs";
                                //try {
                                //    fileSystem.writeFileSync(haskellTempFile, args.join(" "), { mode: 0o755 });
                                //} catch(err) {
                                //    console.error(err);
                                //}
                                

                                
                                let haskellProcessId = randomString(6, "aA#"); 
                                serverGlobVars[serverId]["ghciProcesses"][haskellProcessId] = {
                                    "proc":childProcess.spawn("ghci",[],{"stdio":"pipe"}),
                                    "messageChannel":message.channel,
                                    "outputBuffer":"",
                                    "errorBuffer":"",
                                    "ready":false,
                                    "commandIssued":false,
                                    "outputGenerated":false,
                                    "idle":false,
                                    "exited":false,
                                    "interactive":true,
                                    "executionTime":0,
                                    "lastOutput":0,
                                    "multilineInput":false,
                                    "enqueuedMessages":[],
                                    "enqueuedErrors":[]
                                }
                                serverGlobVars[serverId]["interactiveSessions"].push({
                                    "procId":haskellProcessId,
                                    "messageChannel":message.channel
                                });
                                message.channel.send("Attaching GHCI standard input/output to this channel, type ':q' to quit, all messages will be redirected to GHCI");
                                serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["proc"].stdout.on("data", (data) => {
                                    try {
                                        serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputBuffer"] += data;
                                        let outBuf = serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputBuffer"];
                                
                                        if (outBuf.includes("\n")) {

                                            let lines = outBuf.split("\n");

                                            let response = lines.splice(0,(lines.length - 1)).join("\n");
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["enqueuedMessages"].push(response);
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["lastOutput"] = serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["executionTime"];
                                            
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputBuffer"] = lines.join("\n");
                                            outBuf = serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputBuffer"];
                                        }
                                        if (outBuf.endsWith("> ")) {
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["enqueuedMessages"].push("\n"+outBuf);
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputBuffer"] = "";
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["idle"] = true;
                                            outBuf = "";
                                        }
                                    } catch(ex3) {
                                        if (debugLevel > 0){console.log("[ HASKELL  ] " + ex3);}
                                        if (debugLevel > 0){console.log(ex3.stack);}
                                    };
                                });
                                serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["proc"].stderr.on("data", (data) => {
                                    try {
                                        serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["outputBuffer"] += data;
                                        let outBuf = serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["errorBuffer"];
                                
                                        if (outBuf.includes("\n")) {

                                            let lines = outBuf.split("\n");

                                            let response = lines.splice(0,(lines.length - 1)).join("\n");
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["enqueuedErrors"].push(response);
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["lastOutput"] = serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["executionTime"];
                                            
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["errorBuffer"] = lines.join("\n");
                                            outBuf = serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["errorBuffer"];
                                            serverGlobVars[serverId]["ghciProcesses"][haskellProcessId]["idle"] = true;
                                        }
                                    } catch(ex3) {
                                        if (debugLevel > 0){console.log("[ HASKELL  ] " + ex3);}
                                        if (debugLevel > 0){console.log(ex3.stack);}
                                    };
                                });
                            } catch(ex2) {
                                if (debugLevel > 0){console.log("[ HASKELL  ] " + ex2);}
                                if (debugLevel > 0){console.log(ex2.stack);}
                            };
                            break;
                        case 'help':
                            displayHelp(serverId)
                            break;
                        default:
                            message.channel.send(cmd+"? That's not a valid command "+message.author.username);
                        // Just add any case commands if you want to..
                    }
                }
            }
        }
    } catch(ex) {
        if (debugLevel > 0){console.log("[  ERROR   ] " + ex);}
        if (debugLevel > 0){console.log(ex.stack);}
    };
});

function displayHelp(serverId) {
    var builtInsert = "";
    builtInsert = builtInsert + "\n\n**Hi, I'm the ghci bot!**";
    builtInsert = builtInsert + "\nSo this can run on discord, there are limits on execution time and output size. File IO functions are disabled for security reasons.";
    builtInsert = builtInsert + "\n\n**Commands:**\n\n";
    if (triggerPrefixEval != null) {
        builtInsert = builtInsert + "```" + triggerPrefixEval + "<your expression>```";
    }
    builtInsert = builtInsert + "```" + triggerPrefix + " eval <your expression>```";
    builtInsert = builtInsert + "Evaluates a haskell expression\n\n";
    builtInsert = builtInsert + "```" + triggerPrefix + " kind <your expression>```";
    builtInsert = builtInsert + "Explains the kind of a data type\n\n";
    builtInsert = builtInsert + "```" + triggerPrefix + " type <your expression>```";
    builtInsert = builtInsert + "Explains the type of a variable\n\n";
    builtInsert = builtInsert + "```" + triggerPrefix + " interactive```";
    builtInsert = builtInsert + "Starts an interactive ghci session\n\n";
    //builtInsert = builtInsert + "\n\ncode";
    //builtInsert = builtInsert + "\n  Runs the code you post after running this command";
    //builtInsert = builtInsert + "\n\nquit";
    //builtInsert = builtInsert + "\n  Quits an interactive session";
    serverGlobVars[serverId].messageChannel.send(builtInsert);
}

function secondsToHumanTime(time) {
    var secNum = parseInt(time, 10); // don't forget the second param
    var hours   = Math.floor(secNum / 3600);
    var minutes = Math.floor((secNum - (hours * 3600)) / 60);
    var seconds = secNum - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (hours > 0) {
        return hours+':'+minutes+':'+seconds;
    } else {
        return minutes+':'+seconds;
    }
}

function randomString(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}


function printOutput(outputText,messageChannel,procId) {
    if (outputText.length > 1920) {
        if (outputText.length > 16384) {
            messageChannel.send("GHCI returned more than 16384 characters, so the response can't be shown at all :(");
        } else {
            let responseProcessed = "";
            while (outputText.length > 0) {
                responseProcessed += outputText.substring(0, 64) + "\n";
                outputText = outputText.substring(64);
            }
            fileSystem.writeFileSync("/tmp/ghciOutput" + procId + ".png", text2png(responseProcessed.substring(1), {
                font: "18px Roboto Mono",
                bgColor: "#36393f",
                textColor: "#ffffff",
                lineSpacing: 10,
                padding: 10
            }));
            messageChannel.send("GHCI returned more than 1920 characters, so the response has to be displayed as an image");
            messageChannel.send("", {
                files: [
                    "/tmp/ghciOutput" + procId + ".png"
                ]
            });
        }
    } else {
        if (outputText.length > 1) {
            messageChannel.send("```haskell\n" + outputText + "```");
        } else {
            messageChannel.send("GHCI didn't return any output (either GHCI crashed or this is a bug!)");
        }
    }
}

function outputMessages(serverId,procId) {
    let outputText = "";
    while (serverGlobVars[serverId]["ghciProcesses"][procId]["enqueuedMessages"].length > 0) {
        let lineOut = serverGlobVars[serverId]["ghciProcesses"][procId]["enqueuedMessages"].splice(0,1)[0];
        outputText = outputText + lineOut + "\n";
    }
    
    if (serverGlobVars[serverId]["ghciProcesses"][procId]["errorBuffer"].length > 0) {
        serverGlobVars[serverId]["ghciProcesses"][procId]["messageChannel"].send("GHCI returned an error:");
        let linesOut = serverGlobVars[serverId]["ghciProcesses"][procId]["errorBuffer"].split("\n");
        //linesOut.splice(0,2)
        for (let i=0; i<linesOut.length; i++) {
            if (linesOut[i].startsWith("<interactive>")) {
                console.log(linesOut[i].indexOf("error:") + 6);
                linesOut[i] = linesOut[i].substring((linesOut[i].indexOf("error:") + 7));
            }
        }
        outputText = outputText + linesOut.join("\n") + "\n";
    }
    
    //serverGlobVars[serverId]["ghciProcesses"][procId]["messageChannel"].send("```haskell\n"+outputText+"```");
    
    printOutput(outputText,serverGlobVars[serverId]["ghciProcesses"][procId]["messageChannel"],procId);
    
    serverGlobVars[serverId]["ghciProcesses"][procId]["proc"].kill("SIGHUP");
    delete serverGlobVars[serverId]["ghciProcesses"][procId];
}

function routineChecks() {
    for (let i=0; i<serverGlobVars.length; i++) {
        for (const procId in serverGlobVars[i]["ghciProcesses"]) {
            //console.log("execTime " + serverGlobVars[i]["ghciProcesses"][procId]["executionTime"]);
            serverGlobVars[i]["ghciProcesses"][procId]["executionTime"]++;
            
            if (serverGlobVars[i]["ghciProcesses"][procId]["outputGenerated"]) {
                //console.log("ExecTime " + serverGlobVars[i]["ghciProcesses"][procId]["executionTime"]);
                //console.log("LastOutput " + serverGlobVars[i]["ghciProcesses"][procId]["lastOutput"]);
                
                if (serverGlobVars[i]["ghciProcesses"][procId]["executionTime"] > (serverGlobVars[i]["ghciProcesses"][procId]["lastOutput"] + 128)) {
                    serverGlobVars[i]["ghciProcesses"][procId]["idle"] = true;
                } else {
                    serverGlobVars[i]["ghciProcesses"][procId]["idle"] = false;
                }
            } else {
                //console.log("ExecTime Not Returned " + serverGlobVars[i]["ghciProcesses"][procId]["executionTime"]);
            }
            
            if (serverGlobVars[i]["ghciProcesses"][procId]["interactive"]) {
                if (serverGlobVars[i]["ghciProcesses"][procId]["enqueuedMessages"].length > 0) {
                    if (serverGlobVars[i]["ghciProcesses"][procId]["executionTime"] > (serverGlobVars[i]["ghciProcesses"][procId]["lastOutput"] + 64)) {
                        //serverGlobVars[i]["ghciProcesses"][procId]["messageChannel"].send("```haskell\n" + serverGlobVars[i]["ghciProcesses"][procId]["enqueuedMessages"].join("\n") + "```");
                        printOutput(serverGlobVars[i]["ghciProcesses"][procId]["enqueuedMessages"].join("\n"),serverGlobVars[i]["ghciProcesses"][procId]["messageChannel"],procId);
                        serverGlobVars[i]["ghciProcesses"][procId]["enqueuedMessages"] = [];
                    }
                }
            }
            
            if (serverGlobVars[i]["ghciProcesses"][procId]["idle"]) {
                if (serverGlobVars[i]["ghciProcesses"][procId]["interactive"]) {
                    if ((maxInteractiveTime > 0) && ((serverGlobVars[i]["ghciProcesses"][procId]["executionTime"] - serverGlobVars[i]["ghciProcesses"][procId]["lastOutput"]) > maxInteractiveTime)) {
                        if (!serverGlobVars[i]["ghciProcesses"][procId]["idle"]) {
                            if (debugLevel > 2){console.log("[   INFO   ] Killing old ghci environment");}
                            for (let j=0; j<serverGlobVars[i]["interactiveSessions"].length; j++) {
                                if (procId == serverGlobVars[i]["interactiveSessions"][j]["procId"]) {
                                    console.log("Splicing interactive session");
                                    serverGlobVars[i]["interactiveSessions"].splice(j,1);
                                }
                            }
                            serverGlobVars[i]["ghciProcesses"][procId]["messageChannel"].send("Interactive session was terminated for being idle for too long ("+(maxInteractiveTime/1000)+" seconds)");
                            delete serverGlobVars[i]["ghciProcesses"][procId];
                        }
                    }
                } else {
                    outputMessages(i,procId);
                }
                
            } else {
                if (serverGlobVars[i]["ghciProcesses"][procId]["interactive"]) {
                    if ((maxExecutionTime > 0) && ((serverGlobVars[i]["ghciProcesses"][procId]["executionTime"] - serverGlobVars[i]["ghciProcesses"][procId]["lastOutput"]) > maxExecutionTime)) {
                        if (debugLevel > 2){console.log("[   INFO   ] Killing overruning haskell script");}
                        serverGlobVars[i]["ghciProcesses"][procId]["messageChannel"].send("Script was terminated for taking too long ("+(maxExecutionTime/1000)+" seconds)");
                        
                        for (let j=0; j<serverGlobVars[i]["interactiveSessions"].length; j++) {
                            if (procId == serverGlobVars[i]["interactiveSessions"][j]["procId"]) {
                                console.log("Splicing interactive session");
                                serverGlobVars[i]["interactiveSessions"].splice(j,1);
                            }
                        }
                        serverGlobVars[i]["ghciProcesses"][procId]["proc"].kill("SIGHUP");
                        serverGlobVars[i]["ghciProcesses"][procId]["messageChannel"].send("Ending interactive session");
                        delete serverGlobVars[i]["ghciProcesses"][procId];
                    }
                } else {
                    if ((maxExecutionTime > 0) && (serverGlobVars[i]["ghciProcesses"][procId]["executionTime"] > maxExecutionTime)) {
                        if (debugLevel > 2){console.log("[   INFO   ] Killing overruning haskell script");}
                        serverGlobVars[i]["ghciProcesses"][procId]["messageChannel"].send("Script was terminated for taking too long ("+(maxExecutionTime/1000)+" seconds)");
                        outputMessages(i,procId);
                    }
                }
            }
        }
    }
}

try{
    discordClientObject.login(discordApiKey);
    setInterval(routineChecks, 1);
} catch(ex) {
    console.log("[*CRITICAL*] COULD NOT LOGIN TO DISCORD")
    console.log("[  DETAIL  ] " + ex);
}
