/* Entry point and orchestration script */
const { exec } = require('child_process')
const request = require('request')

/* Trigger bidding workflow with specified parameters */
const startWorkflow = (temperature, humidity) => {
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

        console.log(body)
        return body
    })
}

/* Start O-MI server */
const startOmiServer = () => {
    exec('docker pull aaltoasia/o-mi', (err, stdout, stderr) => {
        if (err) {
            console.log(err)
        }  else {
            console.log('Pulled docker image')
            exec('docker run aaltoasia/o-mi', (err, stdout, stderr) => {
                if (err) {
                    console.log(`${err}; Make sure you have a docker deamon running!`)
                }  else {
                    console.log('Started O-MI server')
                }
            })
        }
    })
}


startWorkflow(
    Math.random() * 20 + 10,
    Math.random() * 20 + 5
)

startOmiServer()



