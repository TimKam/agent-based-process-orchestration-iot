const OmiClient = require('omi-odf').OmiClient

const generateRandomNumber = (min, max) =>
    Math.random() * (max - min) + min

const args = process.argv.slice(2)

const host = `ws://${args[0]}:8080`
const omiClient = new OmiClient(host)

omiClient.once('ready', () => {
    console.log(`OmiClient connected to ${host}.`)
    
    const name = 'iotMockDevice'
    const path = `things/${name}`
    const ep1 = 'Humidity'
    const ep2 = 'Temperature'
    const ep3 = 'HealthLevel'
    const healthLevels = ['very_high', 'high', 'medium', 'low', 'very_low']

    let humidity = 10
    let temperature = 20
    let healthLevel = 'very_high'

    const options = {}

    // ensure the instance in the O-MI node by issuing a write command
    omiClient.write(path, 'relay', false, options)

    setInterval(() => {
        temperature += generateRandomNumber(-1, 1)
        if (temperature < 0 || temperature > 50) temperature = generateRandomNumber(10, 30)

        humidity += generateRandomNumber(-1, 1)
        if (humidity < 0 || humidity > 50) humidity = generateRandomNumber(10, 20)

        if (Math.random() < 0.2) {
            if (Math.random() < 0.1) {
                if (healthLevels.length > healthLevels.indexOf(healthLevel) + 1)
                healthLevel = healthLevels[healthLevels.indexOf(healthLevel) + 1]
            } else {
                if (healthLevels.indexOf(healthLevel) > 0)
                healthLevel = healthLevels[healthLevels.indexOf(healthLevel) + 1]
            }
        }

        // write latest "measured" (somewhat pseudo-randomly generated) humidity level
        omiClient.write(path, humidity, 10)
        console.log('write', path, `${ep1}: ${humidity}`, `${ep2}: ${temperature}`, `${ep3}: ${healthLevel}`)
         // write latest "measured" (somewhat pseudo-randomly generated) temperature level
        omiClient.write(path, temperature, 20)
        // write latest "measured" production line health indicator (somewhat pseudo-randomly generated)
        omiClient.write(path, ep3, healthLevel)
    }, 2500)

    setTimeout(() => { omiClient.write(path, 'relay', true) }, 500)
})

omiClient.once('close', () => {
    console.log('OmiClient websocket connection was lost.')
    process.exit(1)
})
