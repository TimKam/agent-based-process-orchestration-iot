/* Entry point and orchestration script */
const exec = require('child_process').exec
const request = require('request')

const args = process.argv.slice(2)
const omiNodeAddress = args[0]

const path = process.cwd()

/* Trigger bidding workflow with specified parameters */
const startWorkflow = (temperature, humidity, callback) => {
    const options = { method: 'POST',
        url: 'https://workflow.signavio.com/api/v1/public/cases',
        headers: 
        { 'cache-control': 'no-cache',
            'Content-Type': 'application/json' },
        json:{
            "triggerInstance": {
              "sourceWorkflowId": "5ce46813d1dfff36e89f2177",
              "data": {
                "formInstance": {
                  "value": {
                    "fields": [
                      {
                        "id": "prwtiuluaj23rppvpp",
                        "value": humidity,
                        "type": {
                            "name": "number",
                            "minValue": 0,
                            "maxValue": 100
                        } 
                      },
                      {
                        "id": "prwti6csf12ra1nc96",
                        "value": temperature,
                        "type": {
                            "name": "number",
                            "minValue": -20,
                            "maxValue": 60
                        }
                      }
                    ]
                  }
                }
              }
            } 
        }
    }

    return request(options, (error, response, body) => {
    if (error) throw new Error(error)

        console.log(`Workflow started: ${JSON.stringify(body.id)}`)
        callback(body.id)
        return body
    })
}

/* Start agents and IoT mocks */
const startIotMock = () => {
    exec(`node ${path}/iot-mocks/iotMock.js ${omiNodeAddress}`, (err) => {
        if (err) {
            console.log(err)
        }  else {
            console.log('Started IoT mock service!')
        }
    })
}
const startIotAgent = caseId => {
    exec(`node ${path}/agents/iotAgent.js ${omiNodeAddress} ${caseId}`, (err) => {
        if (err) {
            console.log(err)
        }
    })
}

const startManagerAgent = caseId => {
    exec(`node ${path}/agents/managerAgent.js ${omiNodeAddress} ${caseId}`, (err) => {
        if (err) {
            console.log(err)
        }
    })
}

const callback = caseId => {
    console.log('Starting IoT mock service...')
    startIotMock()
    console.log('Starting IoT agent service...')
    startIotAgent(caseId)
    console.log('Starting manager agent service...')
    startManagerAgent(caseId)
}

startWorkflow(
    Math.random() * 20 + 10,
    Math.random() * 20 + 5,
    callback
)

