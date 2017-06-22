#!/usr/bin/env node

const colors = require('colors');
const LineByLineReader = require('line-by-line');
const program = require('commander');
const chokidar = require('chokidar');
const fs = require("fs");
const path = require('path');


program
    .version('0.0.1')
    .option('-p, --path [path]', 'Path to xbea log')
    .parse(process.argv);


const DEFAULT_PATH = 'C:/Xbea/Logs/VIP/';
const PATH = program.path || DEFAULT_PATH;

function parseLog(path) {
    const lr = new LineByLineReader(path);
    const lines = [];
    lr.on('line', function (line) {
        lines.push(line)
    });
    lr.on('end', function () {
        Array.from(new Set(lines)).forEach((line) => {
            if (line.search(/SymConnectClient/) > 0) {

                const repgenNamePattern = line.match(/[.A-Z]+\.RG/);
                const repgenName = repgenNamePattern && repgenNamePattern.length ? repgenNamePattern[0] : line;

                if (line.search(/Request:/) > 0) {
                    const repgenResponse = line.replace(/^.*Request:\s(.*)$/, '$1')
                    console.log(`\r\n\tRequest of ${repgenName}\r\n`.blue.bold);
                    console.log(`\t${repgenResponse.replace(/~/g, '\r\n\t')}`.cyan);
                }
                if (line.search(/Response:/) > 0) {
                    const repgenResponse = line.replace(/^.*Response:\s(.*)$/, '$1')
                    console.log(`\r\n\tResponse of ${repgenName}\r\n`.blue.bold);
                    console.log(`\t${repgenResponse.replace(/\|/g, '\r\n\t').replace(/~JRGLINE=/g, '').replace(/~/g, '\r\n\t')}`.green);
                    console.log('\r\n\t-------------------------------------\r\n'.grey);
                }
            }
        });
    });
}

if (PATH) {

    function getLastModifiedFile(path) {
        const files = fs.readdirSync(path);
        const sortedFiles = files.filter((item)=>{
                return fs.statSync(path + item).isFile();
        }).sort(function(a, b) {
            return fs.statSync(path + a).mtime.getTime() -
                fs.statSync(path + b).mtime.getTime();
        });

        if(sortedFiles.length) {
            return path  + sortedFiles[0]
        } else {
            return null;
        }
    }

    try {
        const lastFile = fs.statSync(PATH).isFile() ? PATH : getLastModifiedFile(PATH);
        chokidar.watch(PATH, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
            if(lastFile) {
                parseLog(lastFile);
            }
        })
    }
    catch(err) {
        console.log(`Path ${PATH} does't exist :(`.cyan);
    }





}
