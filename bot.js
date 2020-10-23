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
var experimentalFeatureLevel = 0;
var maxExecutionTime = 0;
console.log("[   INFO   ] Initialising riamu-bot");
try{keyFile = configFile["keys"];if(keyFile == undefined){throw "notFound";};}catch(ex){console.log("[*CRITICAL*] NO API KEYS!")}
try{botUsername = configFile["botUsername"];if(botUsername == undefined){throw "notFound";};}catch(ex){console.log("[ WARNING  ] No username for bot, it may start talking to itself")}
try{botUserId = configFile["botUserId"];if(botUserId == undefined){throw "notFound";};}catch(ex){console.log("[ WARNING  ] No user id for bot, it may start talking to itself")}
try{debugLevel = configFile["debugLevel"];if(debugLevel == undefined){throw "notFound";};}catch(ex){console.log("[ WARNING  ] No debug level set, defaulting to max (you may get a lot of console clutter)");debugLevel = 3;}
try{triggerSuffix = configFile["triggerSuffix"];if(triggerSuffix == undefined){throw "notFound";};}catch(ex){console.log("[   INFO   ] No trigger suffix set, disabling");triggerSuffix = null;}
try{triggerPrefix = configFile["triggerPrefix"];if(triggerPrefix == undefined){throw "notFound";};}catch(ex){console.log("[   INFO   ] No trigger prefix set, disabline");triggerPrefix = null;}
try{experimentalFeatureLevel = configFile["experimentalFeatureLevel"];if(experimentalFeatureLevel == undefined){throw "notFound";};}catch(ex){console.log("[   INFO   ] No experimental feature level set, defaulting to stable features");experimentalFeatureLevel = 0;}
try{maxExecutionTime = configFile["maxExecutionTime"];if(maxExecutionTime == undefined){throw "notFound";};}catch(ex){console.log("[   INFO   ] No max execution time");maxExecutionTime = -1;}

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
            var serverID = undefined;
            //console.log(message.guild.name)
            var foundServer = false;
            for (i=0;i<serverGlobVars.length;i++) {
                if (serverGlobVars[i]["server"] == reaction.message.guild) {
                    foundServer = true;
                    serverID = i;
                }
            }

            if (foundServer) {
                if (permissionState(user.id,serverID,"music","skip")){
                    if (serverGlobVars[serverID]["lastQueue"].id == reaction.message.id) {
                        var reactionEmoji = reaction.emoji.name;

                        switch(reactionEmoji) {
                            case "\u23EE":
                                if (debugLevel > 2){console.log("[   INFO   ] Button: PrevTrack");};
                                commands.skipBack(null,reaction.message.channel,user.id,serverID);
                                break;
                            case "\u23ED":
                                if (debugLevel > 2){console.log("[   INFO   ] Button: SkipForward");};
                                commands.skipAhead(null,reaction.message.channel,user.id,serverID);
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
                                commands.shuffle(null,reaction.message.channel,user.id,serverID);
                                break;//FE0F
                            case "\u{1F501}":
                                if (debugLevel > 2){console.log("[   INFO   ] Button: Loop");};
                                commands.loop(null,reaction.message.channel,user.id,serverID);
                                break;//FE0F
                        }

                        reaction.remove(user).then(reaction => {
                            if (debugLevel > 2){console.log("[   INFO   ] Removed reaction from buttons");};
                    	});
                        //reaction.message.delete();
                        //displayQueue(serverID);
                    }
                } else {
                    serverGlobVars[serverID].messageChannel.send("You don't have the permission [music.skip] to do that ;-;");
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

discordClientObject.on('message', message => {
    try{
        if (((triggerSuffix != null) && message.content.endsWith(triggerSuffix)) || ((triggerPrefix != null) && message.content.startsWith(triggerPrefix))) {
            if (message.author.id != botUserId) {
                let rawMessage = message.content;
                if (message.content.endsWith(triggerSuffix)){
                    rawMessage = rawMessage.substring(0, message.content.length - (triggerSuffix.length));
                } else {
                    rawMessage = rawMessage.substring(triggerPrefix.length + 1, rawMessage.length);
                }
                let args = rawMessage.split(' ');
                while (args.indexOf("") > -1) {
                    args.splice(args.indexOf(""),1);
                }
                let cmd = makeLowerCase(args[0]);
                let serverID = null;
                //console.log(message.guild.name)
                let foundServer = false;
                for (i=0;i<serverGlobVars.length;i++) {
                    if (serverGlobVars[i]["server"] == message.guild) {
                        foundServer = true;
                        serverID = i;
                    }
                }
                if (foundServer == false) {
                    let testRowIndex = serverGlobVars.push({
                        "server":message.guild,
                        "ghciProcesses":{}
                    }) - 1;
                    for (i=0;i<serverGlobVars.length;i++) {
                        if (serverGlobVars[i]["server"] == message.guild) {
                            serverID = i;
                        }
                    }
                }
                console.log("[   INFO   ] ServerID = " + serverID);
                serverGlobVars[serverID].messageChannel = message.channel;

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
                        builtInsert = builtInsert + "Current Server ID :" + serverID + "\n"
                        builtInsert = builtInsert + "Build Number :" + 3 + "\n"
                        serverGlobVars[serverID].messageChannel.send("```markdown\n" + builtInsert + "```");
                        break;
                    case 'eval':
                        if (args.length > 0) {
                            try {
                                //let haskellFunction = haskell(args.join(" "));
                                //let haskellResponse = haskellFunction();
                                let haskellProcessId = randomString(6, "aA#"); 
                                let haskellExpression = args.join(" ");
                                
                                if (haskellExpression.includes("writeFile")) {
                                    message.channel.send("File IO is not permitted on the GHCI bot");
                                    throw("writeFile attempted");
                                }
                                if (haskellExpression.includes("appendFile")) {
                                    message.channel.send("File IO is not permitted on the GHCI bot");
                                    throw("appendFile attempted");
                                }
                                if (haskellExpression.includes("readFile")) {
                                    message.channel.send("File IO is not permitted on the GHCI bot");
                                    throw("readFile attempted");
                                }
                                if (haskellExpression.includes("readIO")) {
                                    message.channel.send("File IO is not permitted on the GHCI bot");
                                    throw("readIO attempted");
                                }
                                if (haskellExpression.includes("readLn")) {
                                    message.channel.send("File IO is not permitted on the GHCI bot");
                                    throw("readLn attempted");
                                }
                                //args.join(" ")
                                serverGlobVars[serverID]["ghciProcesses"][haskellProcessId] = {
                                    "proc":childProcess.spawn("ghci",[],{"stdio":"pipe"}),
                                    "messageChannel":message.channel,
                                    "outputBuffer":"",
                                    "errorBuffer":"",
                                    "ready":false,
                                    "commandIssued":false,
                                    "outputGenerated":false,
                                    "executionTime":0
                                }
                                serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["proc"].stdout.on("data", (data) => {
                                    try {
                                        //console.log("GHCI " + serverID + ":" + haskellProcessId + " data=" + data);
                                        serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["outputBuffer"] += data;
                                        
                                        let outBuf = serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["outputBuffer"];
                                        
                                        do {
                                            if (outBuf.includes("\n")) {
                                                //console.log(outBuf);
                                                //message.channel.send(outBuf);
                                                let lines = outBuf.split("\n");
                                                //console.log("[srvprnt] " + lines[0]);
                                                if (serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["commandIssued"] && (!serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["outputGenerated"])) {
                                                    let response = lines[0];
                                                    if (response.length > 1920) {
                                                        if (response.length > 16384) {
                                                            message.channel.send("GHCI returned more than 16384 characters, so the response can't be shown at all :(");
                                                        } else {
                                                            let responseProcessed = "";
                                                            while (response.length > 0) {
                                                                responseProcessed += response.substring(0, 64) + '\n';
                                                                response = response.substring(64);
                                                            }
                                                            //console.log(response.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;"));
                                                            fileSystem.writeFileSync("/tmp/ghciOutput" + haskellProcessId + ".png", text2png(responseProcessed, {
                                                                font: "18px Roboto Mono",
                                                                bgColor: "#36393f",
                                                                textColor: "#ffffff",
                                                                lineSpacing: 10,
                                                                padding: 10
                                                            }));
                                                            message.channel.send("GHCI returned more than 1920 characters, so the response has to be displayed as an image");
                                                            message.channel.send("", {
                                                                files: [
                                                                    "/tmp/ghciOutput" + haskellProcessId + ".png"
                                                                ]
                                                            });
                                                        }
                                                    } else {
                                                        message.channel.send("```haskell\n" + response + "```");
                                                    }
                                                }
                                                lines = lines.splice(0,1);
                                                serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["outputBuffer"] = lines.join("\n");
                                                outBuf = serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["outputBuffer"];
                                            }
                                            if (outBuf.endsWith("> ")) {
                                                //console.log(outBuf);
                                                serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["outputBuffer"] = "";
                                                //serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["proc"].stdin.write(":q");
                                                if (serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["commandIssued"]) {
                                                    serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["outputGenerated"] = true;
                                                    serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["proc"].stdin.write(":q\n");
                                                } else {
                                                    serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["proc"].stdin.write(haskellExpression + "\n");
                                                    serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["commandIssued"] = true;
                                                }
                                            }
                                        } while (outBuf.includes("\n"));
                                    } catch(ex3) {
                                        if (debugLevel > 0){console.log("[ HASKELL  ] " + ex3);}
                                        if (debugLevel > 0){console.log(ex3.stack);}
                                    };
                                });
                                
                                serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["proc"].stderr.on("data", (data) => {
                                    try {
                                        serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["errorBuffer"] += data;
                                        
                                        let outBuf = serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["errorBuffer"];

                                        if (outBuf.endsWith("\n")) {
                                            if (outBuf.length > 1) {
                                                message.channel.send("GHCI returned an error:\n```" + outBuf.replace("<interactive>", "") + "```");
                                            }
                                            serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["errorBuffer"] = "";
                                        }
                                    } catch(ex3) {
                                        if (debugLevel > 0){console.log("[ HASKELL  ] " + ex3);}
                                        if (debugLevel > 0){console.log(ex3.stack);}
                                    };
                                });
                                
                                serverGlobVars[serverID]["ghciProcesses"][haskellProcessId]["proc"].on("exit", (code) => {
                                    try {
                                        delete serverGlobVars[serverID]["ghciProcesses"][haskellProcessId];
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
                    case "codedfhsdfhsdfhsdfh":
                        if (args.length > 0) {
                            try {
                                //let haskellFunction = haskell(args.join(" "));
                                //let haskellResponse = haskellFunction();
                                let haskellTempFile = "/tmp/ghciBot" + randomString(6, "aA#") + ".hs";
                                try {
                                    fileSystem.writeFileSync(haskellTempFile, args.join(" "), { mode: 0o755 });
                                } catch(err) {
                                    console.error(err);
                                }
                                
                                let ghciProcess = childProcess.spawn("ghci",[haskellTempFile],{"stdio":"pipe"});
                                ghciProcess.stdout.on("data", (data) => {
                                    console.log("Received chunk " + data);
                                });
                            } catch(ex2) {
                                if (debugLevel > 0){console.log("[ HASKELL  ] " + ex2);}
                                if (debugLevel > 0){console.log(ex2.stack);}
                            };
                        } else {
                            message.channel.send("You need to provide an expression to evaluate!");
                        }
                        break;
                    case 'help':
                        displayHelp(serverID)
                        break;
                    default:
                        message.channel.send(cmd+"? That's not a valid command "+message.author.username);
                    // Just add any case commands if you want to..
                }
            }
        }
    } catch(ex) {
        if (debugLevel > 0){console.log("[  ERROR   ] " + ex);}
        if (debugLevel > 0){console.log(ex.stack);}
    };
});

function displayHelp(serverID) {
    var builtInsert = "";
    builtInsert = builtInsert + "\n\n**Hi, I'm the ghci bot!**";
    builtInsert = builtInsert + "\nI'm not quite as good as ghci, so this can run on discord, there are limits on execution time and memory usage. IO functions are disabled.";
    builtInsert = builtInsert + "\n\n**Commands:**";
    builtInsert = builtInsert + "\n\neval <your expression>";
    builtInsert = builtInsert + "\n  Evaluates a haskell expression";
    //builtInsert = builtInsert + "\n\ninteractive";
    //builtInsert = builtInsert + "\n  Starts an interactive ghci session";
    //builtInsert = builtInsert + "\n\ncode";
    //builtInsert = builtInsert + "\n  Runs the code you post after running this command";
    //builtInsert = builtInsert + "\n\nquit";
    //builtInsert = builtInsert + "\n  Quits an interactive session";
    serverGlobVars[serverID].messageChannel.send(builtInsert);
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

function routineChecks() {
    for (let i=0; i<serverGlobVars.length; i++) {
        for (const procId in serverGlobVars[i]["ghciProcesses"]) {
            //console.log("execTime " + serverGlobVars[i]["ghciProcesses"][procId]["executionTime"]);
            serverGlobVars[i]["ghciProcesses"][procId]["executionTime"]++;
            if ((maxExecutionTime > 0) && (serverGlobVars[i]["ghciProcesses"][procId]["executionTime"] > maxExecutionTime)) {
                serverGlobVars[i]["ghciProcesses"][procId]["proc"].kill("SIGHUP");
                if (debugLevel > 2){console.log("[   INFO   ] Killed overruning haskell script");}
                serverGlobVars[i]["ghciProcesses"][procId]["messageChannel"].send("Script was terminated for taking too long ("+(maxExecutionTime/1000)+" seconds)");
                delete serverGlobVars[i]["ghciProcesses"][procId];
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
