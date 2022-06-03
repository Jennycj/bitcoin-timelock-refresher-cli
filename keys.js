const { generateMnemonic, mnemonicToSeed } = require('bip39')
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
const { payments, Psbt, networks, bip32, script, opcodes } = require("bitcoinjs-lib");
const fs = require("fs");

const { fromSeed } = BIP32Factory(ecc)
const network  = networks.signet

const CreateKeys = async function() {
    try {
     console.log("Creating mnemonic")
        async function generatexpub() {
            let mnemonic;
            const derivationPath = "m/84'/0'/0'"
            if (fs.existsSync("./wallet.json")) {
                 mnemonic = fs.readFileSync("./wallet.json", "utf8");
                 console.log("filemnemonic:", mnemonic)

            } else {    
               mnemonic = generateMnemonic(256)
               console.log(("mnemonic:", mnemonic));
            }
            const seed = await mnemonicToSeed(mnemonic)
            let privateKey = fromSeed(seed, network)
            let xpriv = privateKey.toBase58()
            const child = privateKey.derivePath(derivationPath).neutered()
            const xpub = child.toBase58();
            console.log('privKey', privateKey)
            console.log(privateKey.toString('hex'))

            const keys = {
                "mnemonic": mnemonic,
                "xpriv": xpriv,
                "xpub": xpub,
                "xpubHex": JSON.stringify(privateKey.toString('hex'))
            }
            
            console.log(keys);
            fs.writeFile("wallet.json", JSON.stringify(keys, null, 2), "utf8", (error, data) => {
                console.log("Write complete");
                console.log(error);
                console.log(data);
            });
              
            return mnemonic;
        }
        generatexpub()
    } catch (error) {
        console.log(error.message)
    }
}

const CreateHeirKeys = async function() {
    try {
        let mnemonic;
        const derivationPath = "m/84'/0'/0'"
        async function generatexpub() {
            if (fs.existsSync("./heir.json")) {
                mnemonic = fs.readFileSync("./heir.json", "utf8");
            } else {    
              mnemonic = generateMnemonic(256)
            }
            const seed = await mnemonicToSeed(mnemonic)
            let privateKey = fromSeed(seed, network)
            let xpriv = privateKey.toBase58()
            const child = privateKey.derivePath(derivationPath).neutered()
            const xpub = child.toBase58();
            console.log('privKey', privateKey)
            console.log(privateKey.toString('hex'))

            const heirkeys ={
                "mnemonic": mnemonic,
                "xpriv": xpriv,
                "xpub": xpub,
                "xpubHex": JSON.stringify(privateKey.toString('hex'))
            }
            
            console.log(heirkeys);
            fs.writeFile("heir.json", JSON.stringify(heirkeys, null, 2), "utf8", (error, data) => {
                console.log("Write complete");
                console.log(error);
                console.log(data);
            });
              
            return mnemonic;
        }
        generatexpub()
    } catch (error) {
        console.log(error.message)
    }
}

const createAddress = function() {

    try {
        const heirXpub = "xpub6BgnWYje1h4gvc8pWReszDTzK3Q6xBR9YGhArgfAxoDS6D9cSVa6FXt3fxE9NPGnr6wcQHjNStcsfEyiFaVnNrLHQJDosUBYgheWmAagZW5"
        // const heirXpub = String(process.argv[3])
        console.log(heirXpub)
        if(heirXpub === undefined) {
            console.log("Error! please enter your heir's extended public key after the 'createaddress' command")
            throw Errorr
        } else{

            async function generateAddress() {
                const User = fs.readFileSync("./wallet.json", { flag: 'w+' }, "utf8");
                console.log("user", User.toString());
                const addresses = User.addresses
                console.log(addresses)
                const num = addresses?.length >1? addresses.length-=1 : 1
                console.log(num)
                const derivationPath = `0/${num}`
                console.log(User)
                if(!User) {
                    console.log("You have to create your mnemonics first! Use the 'createmnemonic' command to do this.")
                    return;
                } else {

                xpub = User.xpub;
                console.log(xpub)
                const node = bip32.fromBase58(xpub, networks.signet)
                
                console.log(node)
                const childPubkey =  node.derivePath(derivationPath)
                const heirNode = bip32.fromBase58(heirXpub, networks.signet)
                // const heirNode = BIP32Interface.toBase58(xpub, network)
                const heirChildPubkey = heirNode.derivePath(derivationPath)
                console.log("HeirPubKey: ", heirChildPubkey)
                let witnessScript = generateScript(childPubkey, heirChildPubkey);


                const address = payments.p2wsh({
                        pubkeys: [childPubkey, heirChildPubkey],
                        redeem: { output: witnessScript, network: network },
                        network: network,
                    });

                    witnessScript = witnessScript.toString('hex')
                    console.log(address, witnessScript);
                    const addressObj = [{address, witnessScript}]
                    fs.appendFileSync("./wallet.json", { flag: 'a' }, addressObj)
                    return;
                }
            }
            generateAddress()
        }
    }catch (error) {
        console.log(error)
    }
}
  
    module.exports = {
    CreateKeys,
    CreateHeirKeys,
    createAddress
}

// CreateKeys()
// CreateHeirKeys()
createAddress()