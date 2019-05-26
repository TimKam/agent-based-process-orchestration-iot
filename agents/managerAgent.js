const JSson = require('js-son-agent')
const request = require('request')
const OmiClient = require('omi-odf').OmiClient

// O-MI config
const persistanceUrl = 'https://script.google.com/macros/s/AKfycbyAVkrrCEbP221b8H2NyfMBQn-dv_rgqUx5HR3F2wqx86yCj1U/exec'

const args = process.argv.slice(2)

const host = `ws://${args[0]}:8080`
const name = 'managerAgent'
const path = `agents/${name}`
const omiClient = new OmiClient(host)

const stopProcessPropValue = 'stop_process'

const persist = data => {
    request.get(`${persistanceUrl}?Type=${data.Type}&Property=${data.Property}&Value=${data.Value}`)
}

// Cognitive agent
const Belief = JSson.Belief
const Plan = JSson.Plan
const Agent = JSson.Agent
const Environment = JSson.Environment

let Temperature = undefined
let Humidity = undefined
let HealthLevel = undefined

const beliefs = {
    ...Belief('Temperature', Temperature),
    ...Belief('Humidity', Humidity),
    ...Belief('HealthLevel', HealthLevel),
}

const plans = [
    Plan(
      beliefs => {
            const temperatureTooHigh = beliefs.Temperature && beliefs.Temperature > 35
            const temperatureTooLow = beliefs.Temperature && beliefs.Temperature < 5
            const humidityTooHigh = beliefs.Humidity && beliefs.Humidity > 50
            const humidityTooLow = beliefs.Humidity && beliefs.Humidity < 5
            return beliefs.HealthLevel === 'very_low' ||
                (
                    beliefs.HealthLevel === 'low' &&
                    (
                        temperatureTooHigh ||
                        temperatureTooLow ||
                        humidityTooHigh ||
                        humidityTooLow
                    )
                )
      },
      () => [{ request: stopProcessPropValue }]
    )
]

const manager = new Agent('manager', beliefs, {}, plans)

const state = {
    Temperature: undefined,
    Humidity: undefined,
    HealthLevel: undefined,
    requests: []
}

const updateState = actions => {
    const stateUpdate = {
        Temperature,
        Humidity,
        HealthLevel
    }
    actions.forEach(action => {
      if (action.some(action => action.request === stopProcessPropValue)) {
        console.log('Production environment unstable: manager agent stops bidding process (if running).')
        const managingProperty = 'managingCommand'
        omiClient.write(path, managingProperty, stopProcessPropValue)
        console.log('write', path, `${managingProperty}: ${stopProcessPropValue}`)
        persist({
            Property: `${path}/${managingProperty}`,
            Value: stopProcessPropValue,
            Type: 'string'
        })
      }
    })
    return stateUpdate
}

const stateFilter = state => state

const environment = new Environment(
    [manager],
    state,
    updateState,
    stateFilter
)

// O-MI client
omiClient.once('ready', () => {
    console.log(`OmiClient connected to ${host}.`)

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
                Type: opts.type || 'string'
            })
        }
    })

    omiClient.subscribe('things/iotMockDevice', ep2, options, (ep2, data, opts) => {
        if (data !== 'undefined') {
            console.log('Subscribe:', ep2, data, opts)
            requestData.push({
                Property: ep2,
                Value: data,
                Type: opts.type || 'string'
            })
        }
    })

    omiClient.subscribe('things/iotMockDevice', ep3, options, (ep3, data, opts) => {
        if (data !== undefined) {
            console.log('Subscribe:', ep3, data, opts)
            requestData.push({
                Property: ep3,
                Value: data,
                Type: opts.type || 'string'
            })
        }
    })

    setInterval(() => {
        environment.run(1)
        omiClient.write('things/iotMockDevice', ep1)
        omiClient.write('things/iotMockDevice', ep2)
        omiClient.write('things/iotMockDevice', ep3)
        Temperature = requestData.find(element => element.Property.includes('Temperature'))
            ? requestData.find(element => element.Property.includes('Temperature')).Value
            : Temperature
        Humidity = requestData.find(element => element.Property.includes('Humidity'))
            ? requestData.find(element => element.Property.includes('Humidity')).Value
            : Humidity
        HealthLevel = requestData.find(element => element.Property.includes('HealthLevel'))
            ? requestData.find(element => element.Property.includes('HealthLevel')).Value
            : HealthLevel
        if (requestData.length > 3) requestData = []
    }, 2500)
})

omiClient.once('close', () => {
    console.log('OmiClient websocket connection was lost.')
    process.exit(1)
})
