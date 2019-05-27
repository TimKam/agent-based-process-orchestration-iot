const request = require('request')
const OmiClient = require('omi-odf').OmiClient

const persistanceUrl = 'https://script.google.com/macros/s/AKfycbyAVkrrCEbP221b8H2NyfMBQn-dv_rgqUx5HR3F2wqx86yCj1U/exec'

const args = process.argv.slice(2)

const caseId = args[1]

const host = `ws://${args[0]}:8080`
const omiClient = new OmiClient(host)

const persist = data => {
    request.get(`${persistanceUrl}?Type=${data.Type}&Property=${data.Property}&Value=${data.Value}&Caseid=${data.Caseid}`)
}



omiClient.once('ready', () => {
    console.log(`OmiClient connected to ${host}.`)
    
    const name = 'iotAgent'
    const path = `agents/${name}`
    const relay = 'relay'
    const ep1 = 'Humidity'
    const ep2 = 'Temperature'
    const ep3 = 'HealthLevel'

    const options = {}

    let requestData = []

    // ensure the instance in the O-MI node by issuing a write command
    omiClient.write(path, relay, false)

    // subscribe to changes from "iotMockDevice"
    omiClient.subscribe('things/iotMockDevice', ep1, options, (ep1, data, opts) => {
        if (data !== 'undefined') {
            console.log('Subscribe:', ep1, data, opts)
            requestData.push({
                Property: ep1,
                Value: data,
                Type: opts.type || 'string',
                Caseid: caseId
            })
        }
    })

    omiClient.subscribe('things/iotMockDevice', ep2, options, (ep2, data, opts) => {
        if (data !== 'undefined') {
            console.log('Subscribe:', ep2, data, opts)
            requestData.push({
                Property: ep2,
                Value: data,
                Type: opts.type || 'string',
                Caseid: caseId
            })
        }
    })

    omiClient.subscribe('things/iotMockDevice', ep3, options, (ep3, data, opts) => {
        if (data !== undefined) {
            console.log('Subscribe:', ep3, data, opts)
            requestData.push({
                Property: ep3,
                Value: data,
                Type: opts.type || 'string',
                Caseid: caseId
            })
        }
    })

    setInterval(() => {
        omiClient.write('things/iotMockDevice', ep1)
        omiClient.write('things/iotMockDevice', ep2)
        omiClient.write('things/iotMockDevice', ep3)
        requestData.forEach(data => persist(data))
        if (requestData.length > 3) requestData = []
    }, 2600)
})

omiClient.once('close', () => {
    console.log('OmiClient websocket connection was lost.')
    process.exit(1)
})




