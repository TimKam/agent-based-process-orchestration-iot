const OmiClient = require('omi-odf').OmiClient

const args = process.argv.slice(2)

const host = `ws://${args[0]}:8080`
const omiClient = new OmiClient(host)

omiClient.once('ready', () => {
    console.log(`OmiClient connected to ${host}.`)
    
    const name = 'iotMockDevice'
    const path = `my/path/to/${name}`
    const ep = 'relay'

    // ensure the instance in the O-MI node by issuing a write command
    omiClient.write(path, ep, false)

    // subscribe to changes from "iotAgent"
    omiClient.subscribe('my/path/to/iotAgent', null, {}, (ep, data, opts) => {
        console.log('Subscribe:', ep, data, opts)
    })

    // write ep to true, which should trigger subscription callback
    setTimeout(() => { omiClient.write(path, ep, true) }, 500)
    
    setTimeout(() => {
        omiClient.read(path, ep, (ep, value, opts) => {
            console.log('Read:', ep, value, opts)
        })
    }, 600)
})

omiClient.once('close', () => {
    console.log('OmiClient websocket connection was lost.')
    process.exit(1)
})
