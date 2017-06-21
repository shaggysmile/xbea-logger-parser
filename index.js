const express = require('express');
const chromelogger = require('chromelogger');
const app = express();
const opn = require('opn');
const LineByLineReader = require('line-by-line');

opn('http://localhost:3000', {app: ['chrome', '--inspect']});

app.use(chromelogger.middleware);
app.get('/', (req, res)=> {

    const log = new LineByLineReader('c:\\XBEA\\Logs\\last.log');
    const lines = [];

    res.chrome.log(`%c Start parse log ${log._filepath}`, 'color: #0a8d9b');

    log.on('line', function (line) {
        lines.push(line)
    });

    log.on('end', function () {
        lines.forEach((line)=>{
            if(line.search(/SymConnectClient/)>0){
                if(line.search(/Request:/)>0){

                    const repgenNamePattern = line.match(/[.A-Z]+\.RG/);
                    const repgenName = repgenNamePattern && repgenNamePattern.length ? repgenNamePattern[0] : line;
                    const repgenResponse = line.replace(/^.*Request:\s(.*)$/, '$1')
                    res.chrome.groupCollapsed(`%c Request of ${repgenName}`, 'color: #69a547');
                    res.chrome.log(`%c${repgenResponse}`, 'color: #94939b');
                    res.chrome.groupEnd();

                    //res.chrome.log(line)
                }
                if(line.search(/Response:/)>0){

                    const repgenNamePattern = line.match(/[.A-Z]+\.RG/);
                    const repgenName = repgenNamePattern && repgenNamePattern.length ? repgenNamePattern[0] : line;
                    const repgenResponse = line.replace(/^.*Response:\s(.*)$/, '$1')
                    res.chrome.groupCollapsed(`%c Response of ${repgenName}`, 'color: #3674d8');
                    res.chrome.log(`%c${repgenResponse.replace(/\|/g, '\r\n')}`, 'color: #94939b');
                    res.chrome.groupEnd();

                    //res.chrome.log(line)
                }
            }
        });


        res.json({});
    });
});


app.listen(3000, () => {
    //console.log('Example app listening on port 3000!');
});
