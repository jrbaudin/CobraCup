package main

import (
	"os"
	"text/template"
)

const parseConfig = `
{
  "global": {
    "parseVersion": "1.6.7"
  },
  "applications": {
    "Cobra Cup 2016 Production": {
      "applicationId": "{{.AppID}}",
      "masterKey": "{{.MasterKey}}"
    },
    "_default": {
      "link": "Cobra Cup 2016 Production"
    }
  }
}
`

type creds struct {
	AppID, MasterKey string
}

func main() {
	t := template.Must(template.New("config").Parse(parseConfig))
	c := creds{
		AppID:     os.Getenv("APP_ID"),
		MasterKey: os.Getenv("MASTER_KEY"),
	}
	if err := t.Execute(os.Stdout, c); err != nil {
		panic(err)
	}
}
