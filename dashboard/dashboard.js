const generateRandomInt = (min, max) => {
    min = Math.ceil(min)
    return Math.floor(Math.random() * (Math.floor(max) - min)) + min
}

const url = 'https://spreadsheets.google.com/feeds/cells/1XsFy1Cy3uId4Er0ufz7qfZXdh1XQM-xAX3Zlumg9XGQ/1/public/values?alt=json'

document.addEventListener('DOMContentLoaded', () => {
    fetch(url)
        .then(response => response.json())
        .then(json =>  {
            data = json
            console.log(JSON.stringify(json))

            const temperatureData = []
            const temperatureTimeLine = []
            data.feed.entry.forEach((entry, index) => {
                if(entry.content.$t.includes('Temperature')) {
                    temperatureData.push(data.feed.entry[index + 2].content.$t)
                    temperatureTimeLine.push(data.feed.entry[index - 1].content.$t)
                }
            })

            const humidityData = []
            const humidityTimeLine = []
            data.feed.entry.forEach((entry, index) => {
                if(entry.content.$t.includes('Humidity')) {
                    humidityData.push(data.feed.entry[index + 2].content.$t)
                    humidityTimeLine.push(data.feed.entry[index - 1].content.$t)
                }
            })

            const healthLevelMapping = {
                very_low: 0,
                low: 1,
                medium: 2,
                high: 3,
                very_high: 4
            }

            const healthLevelData = []
            const healLevelTimeLine = []
            data.feed.entry.forEach((entry, index) => {
                if(entry.content.$t.includes('HealthLevel')) {
                    healthLevelData.push(healthLevelMapping[data.feed.entry[index + 2].content.$t])
                    healLevelTimeLine.push(data.feed.entry[index - 1].content.$t)
                }
            })

            const temperatureTrace = {
                x: temperatureTimeLine,
                y: temperatureData,
                type: 'scatter'
            }
            const temperatureLayout = {
                title: 'Temperature',
                font: {
                    family: 'Verdana'
                },
                yaxis: {
                    title: '°C',
                    font: {
                        family: 'Verdana'
                    }
                },
            } 
            Plotly.newPlot('temperature-div', [temperatureTrace], temperatureLayout)

            const humidityTrace = {
                x: humidityTimeLine,
                y: humidityData,
                type: 'scatter'
            }
            const humidityLayout = {
                title: 'Humidity',
                font: {
                    family: 'Verdana'
                },
                yaxis: {
                    title: '°C',
                    font: {
                        family: 'Verdana'
                    }
                },
            } 
            Plotly.newPlot('humidity-div', [humidityTrace], humidityLayout)

            const healthLevelTrace = {
                x: healLevelTimeLine,
                y: healthLevelData,
                type: 'scatter'
            }
            const healthLevelLayout = {
                title: 'Production Health Level',
                font: {
                    family: 'Verdana'
                },
                yaxis: {
                    title: '0: "very low" to 4: "very high"',
                    font: {
                        family: 'Verdana'
                    }
                },
            }
            Plotly.newPlot('health-level-div', [healthLevelTrace], healthLevelLayout)

            const caseData = new Array(5).fill(0).map((_, index) => {
                const bids = generateRandomInt(2, 20)
                const parts = bids * generateRandomInt(20, 300)
                const humanAdjustment = Math.random() < 0.5 ? 'Yes' : 'No'
                const cancellationReason = Math.random() < 0.5 ? 'Storage full' : 'Health level'

                return `
                    <td>${index}</td>
                    <td>${bids}</td>
                    <td>${parts}</td>
                    <td>${humanAdjustment}</td>
                    <td>${cancellationReason}</td>
                `
            })

            document.getElementById('case-data-div').innerHTML = `
                <table>
                <tr>
                <td><strong>Case ID</strong></td>
                <td><strong>#Bids Registered</strong></td>
                <td><strong>#Parts Procured</strong></td>
                <td><strong>Human Adjustment Necessary</strong></td>
                <td><strong>Cancellation Reason</strong></td>
                </tr>
                <tr>
                ${caseData.join('</tr><tr>')}
                </tr>
                </table>`
        }
    )
})
