const {spawn}=require('child_process')
const fs=require('fs')
const path=require('path')

const args=process.argv.slice(2);

const command=args[0];
const fileName=args[1];

if(!fileName || !command){
    console.error('Error: Please provide both command and file name');
    console.error('Usage: node record.js <command> <file-name>');
    process.exit(1);
}

if(command!=='record'){
    console.error('Error: Unsupported command. Only "record" is supported.');
    process.exit(1);
}

if(!fileName.endsWith('.spec.js')){
    console.error('Error: File name must end with .spec.js');
    process.exit(1);
}

const outputDir=path.join(__dirname,"tests")

try{
    if(!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir,{recursive:true})
    }
}
catch(err){
    console.error("Error creating output directory : ",err)
    process.exit(1)
}

const outputPath=path.join(outputDir,fileName)

try{
    if (fs.existsSync(outputPath)) {
        console.error(`Error: File already exists: ${outputPath}`);
        process.exit(1);
    }
}
catch(err){
    console.error("Error checking output file existence : ",err)
    process.exit(1)
}

console.log("Recording Started.....")

const playwrightProcess=spawn('npx',[
    'playwright',
    'codegen',
    '--target=javascript',
    `--output=${outputPath}`,
    'about:blank'
],{
    stdio:'inherit',
    shell: true
})


playwrightProcess.on('close',(eCode)=>{
    if(eCode==0){
        console.log("Recording completed successfully")
        process.exit(0)
    }
    else{
        console.error(`Recording failed. Exit code: ${eCode}`)
        process.exit(eCode)
    }
})

playwrightProcess.on('error',(err)=>{
    console.error("Error Starting Playwright : ",err)
    process.exit(1)
})

process.on('SIGINT', () => {
    console.error('Recording interrupted');
    playwrightProcess.kill();
    process.exit(130);
});

process.on('SIGTERM', () => {
    playwrightProcess.kill();
    process.exit(143);
});

