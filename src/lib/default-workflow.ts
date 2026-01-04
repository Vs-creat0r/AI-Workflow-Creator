export const defaultWorkflow = {
    "nodes": [
        {
            "parameters": {
                "rule": {
                    "interval": [
                        1,
                        "hours"
                    ]
                }
            },
            "name": "Start / Trigger",
            "type": "n8n-nodes-base.cron",
            "typeVersion": 1,
            "position": [
                250,
                300
            ]
        },
        {
            "parameters": {
                "operation": "append",
                "columns": {
                    "values": [
                        {
                            "column": "runId",
                            "value": "={{$json[\"runId\"]}}"
                        },
                        {
                            "column": "timestamp",
                            "value": "={{$now}}"
                        },
                        {
                            "column": "status",
                            "value": "NO_DATA"
                        },
                        {
                            "column": "details",
                            "value": "Zero leads for both primary & fallback query"
                        }
                    ]
                },
                "options": {}
            },
            "name": "Log \"NO_DATA\" & Exit",
            "type": "n8n-nodes-base.googleSheets",
            "credentials": {
                "googleApi": "linkedin-credentials"
            },
            "position": [
                250,
                1200
            ]
        },
        {
            "parameters": {
                "conditions": {
                    "string": [
                        {
                            "value1": "={{$json[\"value\"]}}",
                            "operation": "equals",
                            "value2": "LOCKED"
                        }
                    ]
                }
            },
            "name": "Acquire Run-Lock Check",
            "type": "n8n-nodes-base.if",
            "position": [
                450,
                300
            ]
        },
        {
            "parameters": {
                "functionCode": "// memory check\nconst mem = process.memoryUsage().heapUsed / 1024 / 1024; // MB\nif (mem > 700) {\n  return [{ healthOk: false, details: `Memory ${mem.toFixed(1)} MB > 700 MB` }];\n}\nreturn [{ healthOk: true, details: \"All good\" }];"
            },
            "name": "Health-Check (Resources & Quota)",
            "type": "n8n-nodes-base.function",
            "position": [
                650,
                300
            ]
        },
        {
            "parameters": {
                "requestMethod": "POST",
                "url": "https://www.linkedin.com/oauth/v2/accessToken",
                "sendBody": true,
                "contentType": "form-urlencoded",
                "options": {
                    "bodyContentType": "x-www-form-urlencoded"
                },
                "authentication": "none",
                "bodyParameters": {
                    "parameters": [
                        {
                            "name": "grant_type",
                            "value": "refresh_token"
                        },
                        {
                            "name": "refresh_token",
                            "value": "={{$json[\"refreshToken\"] || $env.LINKEDIN_REFRESH}}"
                        },
                        {
                            "name": "client_id",
                            "value": "={{$env.LINKEDIN_CLIENT_ID}}"
                        },
                        {
                            "name": "client_secret",
                            "value": "={{$env.LINKEDIN_CLIENT_SECRET}}"
                        }
                    ]
                }
            },
            "name": "Refresh LinkedIn Token",
            "type": "n8n-nodes-base.httpRequest",
            "position": [
                850,
                300
            ]
        },
        {
            "parameters": {
                "requestMethod": "GET",
                "url": "https://api.linkedin.com/v2/me",
                "options": {
                    "authentication": "oAuth2Api"
                }
            },
            "name": "Test API Call",
            "type": "n8n-nodes-base.httpRequest",
            "credentials": {
                "oAuth2Api": "linkedin-oauth"
            },
            "position": [
                1050,
                300
            ]
        },
        {
            "parameters": {
                "values": {
                    "queryObject": "={\n  \"keywords\": [\"IT\", \"Manager\", \"Technology\"],\n  \"location\": \"Germany\",\n  \"companySize\": \"200-500\",\n  \"pageSize\": 50\n}"
                }
            },
            "name": "Build & Validate Query",
            "type": "n8n-nodes-base.set",
            "position": [
                1250,
                300
            ]
        },
        {
            "parameters": {
                "requestMethod": "GET",
                "url": "https://api.linkedin.com/v2/search",
                "queryParameters": {
                    "parameters": [
                        {
                            "name": "q",
                            "value": "people"
                        },
                        {
                            "name": "countOnly",
                            "value": "true"
                        },
                        {
                            "name": "keywords",
                            "value": "={{$json[\"queryObject\"][\"keywords\"].join(\",\")}}"
                        },
                        {
                            "name": "location",
                            "value": "={{$json[\"queryObject\"][\"location\"]}}"
                        }
                    ]
                },
                "options": {
                    "authentication": "oAuth2Api"
                }
            },
            "name": "Simulate Query (Count-Only)",
            "type": "n8n-nodes-base.httpRequest",
            "credentials": {
                "oAuth2Api": "linkedin-oauth"
            },
            "position": [
                1450,
                300
            ]
        },
        {
            "parameters": {
                "conditions": {
                    "number": [
                        {
                            "value1": "={{$json[\"total\"]}}",
                            "operation": "equals",
                            "value2": 0
                        }
                    ]
                }
            },
            "name": "Check Zero Results",
            "type": "n8n-nodes-base.if",
            "position": [
                1650,
                300
            ]
        },
        {
            "parameters": {
                "values": {
                    "fallbackQueryObject": "=Object.assign({}, $json.queryObject);\ndelete fallbackQueryObject.location; // remove optional filter\nreturn fallbackQueryObject;"
                }
            },
            "name": "Fallback Query",
            "type": "n8n-nodes-base.set",
            "position": [
                1650,
                500
            ]
        },
        {
            "parameters": {
                "values": {
                    "page": 1,
                    "pageSize": 50,
                    "nextPageToken": null
                }
            },
            "name": "Fetch Leads – Initialise Pagination",
            "type": "n8n-nodes-base.set",
            "position": [
                1450,
                500
            ]
        },
        {
            "parameters": {
                "batchSize": 1
            },
            "name": "SplitInBatches (page-size 50)",
            "type": "n8n-nodes-base.splitInBatches",
            "position": [
                1650,
                700
            ]
        },
        {
            "parameters": {
                "requestMethod": "GET",
                "url": "https://api.linkedin.com/v2/search",
                "queryParameters": {
                    "parameters": [
                        {
                            "name": "q",
                            "value": "people"
                        },
                        {
                            "name": "keywords",
                            "value": "={{$json[\"queryObject\"][\"keywords\"].join(\",\")}}"
                        },
                        {
                            "name": "location",
                            "value": "={{$json[\"queryObject\"][\"location\"]}}"
                        },
                        {
                            "name": "size",
                            "value": "={{$json[\"pageSize\"]}}"
                        },
                        {
                            "name": "start",
                            "value": "={{($json[\"page\"]-1) * $json[\"pageSize\"]}}"
                        },
                        {
                            "name": "paginationToken",
                            "value": "={{$json[\"nextPageToken\"] || \"\"}}"
                        }
                    ]
                },
                "options": {
                    "authentication": "oAuth2Api"
                }
            },
            "name": "HTTP Request – Get Page",
            "type": "n8n-nodes-base.httpRequest",
            "credentials": {
                "oAuth2Api": "linkedin-oauth"
            },
            "position": [
                1850,
                700
            ]
        },
        {
            "parameters": {
                "conditions": {
                    "string": [
                        {
                            "value1": "={{$json[\"paging\"]?.next}}",
                            "operation": "notEquals",
                            "value2": ""
                        }
                    ]
                }
            },
            "name": "Pagination token OK?",
            "type": "n8n-nodes-base.if",
            "position": [
                2050,
                700
            ]
        },
        {
            "parameters": {
                "functionCode": "return $json.elements.map(lead => ({ lead }));"
            },
            "name": "Stream Process Leads",
            "type": "n8n-nodes-base.function",
            "position": [
                2250,
                700
            ]
        },
        {
            "parameters": {
                "functionCode": "const itKeywords = [\"IT\", \"Information Technology\", \"Tech\", \"Engineer\", \"Developer\", \"Administrator\"];\nconst title = $json.lead.title?.toLowerCase() || \"\";\nlet score = 0;\n\n// +2 for each IT keyword in title\nitKeywords.forEach(k => {\n  if (title.includes(k.toLowerCase())) score += 2;\n});\n\n// +1 if industry field contains \"Information Technology\"\nif (($json.lead.industry || \"\").toLowerCase().includes(\"information technology\")) {\n  score += 1;\n}\nreturn [{ ...$json.lead, score }];"
            },
            "name": "Score IT Relevance",
            "type": "n8n-nodes-base.function",
            "position": [
                2450,
                700
            ]
        },
        {
            "parameters": {
                "conditions": {
                    "options": {
                        "multipleValue": "any"
                    },
                    "number": [
                        {
                            "value1": "={{$json[\"score\"]}}",
                            "operation": "equals",
                            "value2": 0
                        },
                        {
                            "value1": "={{$json[\"score\"]}}",
                            "operation": "equals",
                            "value2": 1
                        },
                        {
                            "value1": "={{$json[\"score\"]}}",
                            "operation": "notEquals",
                            "value2": 0
                        }
                    ]
                }
            },
            "name": "Score Decision",
            "type": "n8n-nodes-base.if",
            "position": [
                2650,
                700
            ]
        },
        {
            "parameters": {
                "operation": "append",
                "columns": {
                    "values": [
                        {
                            "column": "Name",
                            "value": "={{$json[\"lead\"][\"firstName\"] + \" \" + $json[\"lead\"][\"lastName\"]}}"
                        },
                        {
                            "column": "Title",
                            "value": "={{$json[\"lead\"][\"title\"]}}"
                        },
                        {
                            "column": "Company",
                            "value": "={{$json[\"lead\"][\"company\"]?.name || \"\"}}"
                        },
                        {
                            "column": "ProfileURL",
                            "value": "={{$json[\"lead\"][\"publicIdentifier\"] ? `https://www.linkedin.com/in/${$json[\"lead\"][\"publicIdentifier\"]}` : \"\"}}"
                        },
                        {
                            "column": "Location",
                            "value": "={{$json[\"lead\"][\"geoLocation\"]?.city || \"\"}}"
                        },
                        {
                            "column": "Score",
                            "value": "={{$json[\"score\"]}}"
                        },
                        {
                            "column": "RunId",
                            "value": "={{$json[\"runId\"]}}"
                        },
                        {
                            "column": "Timestamp",
                            "value": "={{$now}}"
                        }
                    ]
                },
                "options": {}
            },
            "name": "Append to \"Review\" Tab",
            "type": "n8n-nodes-base.googleSheets",
            "credentials": {
                "googleApi": "linkedin-credentials"
            },
            "position": [
                2850,
                600
            ]
        },
        {
            "parameters": {
                "functionCode": "const profileUrl = $json.profileUrl || $json.lead.publicIdentifier\n    ? `https://www.linkedin.com/in/${$json.lead.publicIdentifier}`\n    : null;\n\nreturn [{\n  name: $json.lead.firstName + \" \" + $json.lead.lastName,\n  title: $json.lead.title,\n  company: $json.lead.company?.name || \"\",\n  url: profileUrl,\n  location: $json.lead.geoLocation?.city || \"\",\n  email: $json.lead.emailAddress || \"ENRICH_ME\",\n  phone: $json.lead.phoneNumber || \"ENRICH_ME\",\n  timestamp: new Date().toISOString(),\n  runId: $json.runId\n}];"
            },
            "name": "Extract & Enrich Fields",
            "type": "n8n-nodes-base.function",
            "position": [
                2850,
                800
            ]
        },
        {
            "parameters": {
                "conditions": {
                    "boolean": [
                        {
                            "value1": "={{/^https?:\\/\\/(www\\.)?linkedin\\.com\\/in\\/.+/.test($json.url) && ($json.email === \"ENRICH_ME\" || /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test($json.email))}}",
                            "operation": "equals",
                            "value2": true
                        }
                    ]
                }
            },
            "name": "Validate Data",
            "type": "n8n-nodes-base.if",
            "position": [
                3050,
                800
            ]
        },
        {
            "parameters": {
                "operation": "append",
                "columns": {
                    "values": [
                        {
                            "column": "Name",
                            "value": "={{$json[\"name\"]}}"
                        },
                        {
                            "column": "Title",
                            "value": "={{$json[\"title\"]}}"
                        },
                        {
                            "column": "Company",
                            "value": "={{$json[\"company\"]}}"
                        },
                        {
                            "column": "ProfileURL",
                            "value": "={{$json[\"url\"]}}"
                        },
                        {
                            "column": "Location",
                            "value": "={{$json[\"location\"]}}"
                        },
                        {
                            "column": "Email",
                            "value": "={{$json[\"email\"]}}"
                        },
                        {
                            "column": "Phone",
                            "value": "={{$json[\"phone\"]}}"
                        },
                        {
                            "column": "RunId",
                            "value": "={{$json[\"runId\"]}}"
                        },
                        {
                            "column": "Timestamp",
                            "value": "={{$json[\"timestamp\"]}}"
                        },
                        {
                            "column": "ErrorReason",
                            "value": "Invalid email or URL format"
                        }
                    ]
                },
                "options": {}
            },
            "name": "Log Invalid → \"Invalid Records\"",
            "type": "n8n-nodes-base.googleSheets",
            "credentials": {
                "googleApi": "linkedin-credentials"
            },
            "position": [
                3250,
                700
            ]
        },
        {
            "parameters": {
                "operation": "read",
                "documentId": "={{$env.GSHEET_ID}}",
                "sheetName": "Control",
                "range": "B1",
                "options": {}
            },
            "name": "Acquire Duplicate-Check Lock",
            "type": "n8n-nodes-base.googleSheets",
            "credentials": {
                "googleApi": "linkedin-credentials"
            },
            "position": [
                3250,
                900
            ]
        },
        {
            "parameters": {
                "conditions": {
                    "string": [
                        {
                            "value1": "={{$json[\"value\"]}}",
                            "operation": "equals",
                            "value2": "READY"
                        }
                    ]
                }
            },
            "name": "Check Lock Status",
            "type": "n8n-nodes-base.if",
            "position": [
                3450,
                900
            ]
        },
        {
            "parameters": {
                "waitTime": 30
            },
            "name": "Wait-30s for Lock",
            "type": "n8n-nodes-base.wait",
            "position": [
                3450,
                1100
            ]
        },
        {
            "parameters": {
                "values": {
                    "retryCount": "={{($json[\"retryCount\"] || 0) + 1}}"
                }
            },
            "name": "Increment Retry Counter",
            "type": "n8n-nodes-base.set",
            "position": [
                3650,
                1100
            ]
        },
        {
            "parameters": {
                "operation": "read",
                "documentId": "={{$env.GSHEET_ID}}",
                "sheetName": "IT Leads",
                "range": "D2:D",
                "options": {
                    "returnAll": true
                }
            },
            "name": "Duplicate Check",
            "type": "n8n-nodes-base.googleSheets",
            "credentials": {
                "googleApi": "linkedin-credentials"
            },
            "position": [
                3850,
                900
            ]
        },
        {
            "parameters": {
                "functionCode": "const urlToCheck = $json.cleanLead.url;\nconst existingUrls = $json[\"values\"].flat();\nreturn [{ isDuplicate: existingUrls.includes(urlToCheck) }];"
            },
            "name": "Check for Duplicate URL",
            "type": "n8n-nodes-base.function",
            "position": [
                4050,
                900
            ]
        },
        {
            "parameters": {
                "conditions": {
                    "boolean": [
                        {
                            "value1": "={{$json[\"isDuplicate\"]}}",
                            "operation": "equals",
                            "value2": true
                        }
                    ]
                }
            },
            "name": "Is Duplicate?",
            "type": "n8n-nodes-base.if",
            "position": [
                4250,
                900
            ]
        },
        {
            "parameters": {
                "operation": "update",
                "documentId": "={{$env.GSHEET_ID}}",
                "sheetName": "IT Leads",
                "columnToMatchOn": "D",
                "valueToMatch": "={{$json.cleanLead.url}}",
                "fieldsToUpdate": [
                    {
                        "fieldId": "F",
                        "fieldValue": "={{$now}}"
                    }
                ],
                "options": {}
            },
            "name": "Update \"Last Seen\"",
            "type": "n8n-nodes-base.googleSheets",
            "credentials": {
                "googleApi": "linkedin-credentials"
            },
            "position": [
                4450,
                800
            ]
        },
        {
            "parameters": {
                "functionCode": "if (!$store.get(\"batchBuffer\")) {\n  $store.set(\"batchBuffer\", []);\n}\nconst buf = $store.get(\"batchBuffer\");\nbuf.push($json.cleanLead);\n$store.set(\"batchBuffer\", buf);\nreturn [{ bufferSize: buf.length }];"
            },
            "name": "Buffer Row for Batch Write",
            "type": "n8n-nodes-base.function",
            "position": [
                4450,
                1000
            ]
        },
        {
            "parameters": {
                "conditions": {
                    "number": [
                        {
                            "value1": "={{$json[\"bufferSize\"]}}",
                            "operation": "largerEqual",
                            "value2": 100
                        }
                    ]
                }
            },
            "name": "Check Buffer Size",
            "type": "n8n-nodes-base.if",
            "position": [
                4650,
                1000
            ]
        },
        {
            "parameters": {
                "operation": "append",
                "documentId": "={{$env.GSHEET_ID}}",
                "sheetName": "IT Leads",
                "columns": {
                    "values": [
                        {
                            "column": "Name",
                            "value": "={{$json[\"name\"]}}"
                        },
                        {
                            "column": "Title",
                            "value": "={{$json[\"title\"]}}"
                        },
                        {
                            "column": "Company",
                            "value": "={{$json[\"company\"]}}"
                        },
                        {
                            "column": "ProfileURL",
                            "value": "={{$json[\"url\"]}}"
                        },
                        {
                            "column": "Location",
                            "value": "={{$json[\"location\"]}}"
                        },
                        {
                            "column": "Email",
                            "value": "={{$json[\"email\"]}}"
                        },
                        {
                            "column": "Phone",
                            "value": "={{$json[\"phone\"]}}"
                        },
                        {
                            "column": "Timestamp",
                            "value": "={{$json[\"timestamp\"]}}"
                        },
                        {
                            "column": "RunId",
                            "value": "={{$json[\"runId\"]}}"
                        }
                    ]
                },
                "options": {}
            },
            "name": "Batch Append to \"IT Leads\"",
            "type": "n8n-nodes-base.googleSheets",
            "credentials": {
                "googleApi": "linkedin-credentials"
            },
            "position": [
                4850,
                1000
            ]
        },
        {
            "parameters": {
                "conditions": {
                    "number": [
                        {
                            "value1": "={{$response[\"statusCode\"]}}",
                            "operation": "equals",
                            "value2": 429
                        }
                    ]
                }
            },
            "name": "Quota Error?",
            "type": "n8n-nodes-base.if",
            "position": [
                5050,
                1000
            ]
        },
        {
            "parameters": {
                "operation": "create",
                "folderId": "={{$env.GDRIVE_FOLDER_ID}}",
                "name": "it_leads_spool_{{ $now }}.csv",
                "options": {
                    "bodyContentType": "raw"
                },
                "content": "=\"Name,Title,Company,ProfileURL,Location,Email,Phone,Timestamp,RunId\\n\" + $store.get(\"batchBuffer\").map(lead => `\"${lead.name}\",\"${lead.title}\",\"${lead.company}\",\"${lead.url}\",\"${lead.location}\",\"${lead.email}\",\"${lead.phone}\",\"${lead.timestamp}\",\"${lead.runId}\"`).join(\"\\n\")"
            },
            "name": "Spool to CSV in Drive",
            "type": "n8n-nodes-base.googleDrive",
            "credentials": {
                "googleApi": "linkedin-credentials"
            },
            "position": [
                5250,
                900
            ]
        },
        {
            "parameters": {
                "operation": "update",
                "documentId": "={{$env.GSHEET_ID}}",
                "sheetName": "Control",
                "range": "B1",
                "values": "=[\n  [\"READY\"]\n]",
                "options": {}
            },
            "name": "Release Duplicate-Check Lock",
            "type": "n8n-nodes-base.googleSheets",
            "credentials": {
                "googleApi": "linkedin-credentials"
            },
            "position": [
                5250,
                1100
            ]
        },
        {
            "parameters": {
                "text": "🔔 LinkedIn IT Leads Run Summary ({{$json.runId}})\n🟢 Processed: {{$json.totalProcessed}}\n✅ Added: {{$json.totalAdded}}\n🔁 Duplicates skipped: {{$json.totalDuplicates}}\n⚠️ Errors / Invalid: {{$json.totalInvalid}}\n⏱ Duration: {{$json.duration}}",
                "options": {}
            },
            "name": "Send Summary (Slack)",
            "type": "n8n-nodes-base.slack",
            "credentials": {
                "slackApi": "slack-credentials"
            },
            "position": [
                5650,
                900
            ]
        },
        {
            "parameters": {
                "operation": "append",
                "documentId": "={{$env.GSHEET_ID}}",
                "sheetName": "RunLog",
                "columns": {
                    "values": [
                        {
                            "column": "runId",
                            "value": "={{$json[\"runId\"]}}"
                        },
                        {
                            "column": "timestamp",
                            "value": "={{$now}}"
                        },
                        {
                            "column": "status",
                            "value": "COMPLETED"
                        },
                        {
                            "column": "processed",
                            "value": "={{$json[\"totalProcessed\"]}}"
                        },
                        {
                            "column": "added",
                            "value": "={{$json[\"totalAdded\"]}}"
                        },
                        {
                            "column": "duplicates",
                            "value": "={{$json[\"totalDuplicates\"]}}"
                        },
                        {
                            "column": "invalid",
                            "value": "={{$json[\"totalInvalid\"]}}"
                        },
                        {
                            "column": "duration",
                            "value": "={{$json[\"duration\"]}}"
                        }
                    ]
                },
                "options": {}
            },
            "name": "Log Run Metrics",
            "type": "n8n-nodes-base.googleSheets",
            "credentials": {
                "googleApi": "linkedin-credentials"
            },
            "position": [
                5850,
                900
            ]
        },
        {
            "parameters": {
                "functionCode": "$store.set(\"batchBuffer\", null);\nreturn [{}];"
            },
            "name": "Cleanup",
            "type": "n8n-nodes-base.function",
            "position": [
                6050,
                900
            ]
        },
        {
            "parameters": {
                "values": {
                    "runStatus": "COMPLETED"
                }
            },
            "name": "Mark Run \"COMPLETED\"",
            "type": "n8n-nodes-base.set",
            "position": [
                6250,
                900
            ]
        },
        {
            "parameters": {
                "functionCode": "$store.set(\"circuitOpen\", true);\n$store.set(\"circuitResumeAt\", Date.now() + 3600 * 1000); // 1h\nreturn [{ alert: \"CIRCUIT_OPEN – Pausing further runs for 1h\"}];"
            },
            "name": "Circuit Breaker – Open",
            "type": "n8n-nodes-base.function",
            "position": [
                2050,
                500
            ]
        },
        {
            "parameters": {
                "rule": {
                    "interval": [
                        10,
                        "minutes"
                    ]
                }
            },
            "name": "Resume Check Cron",
            "type": "n8n-nodes-base.cron",
            "position": [
                6450,
                900
            ]
        },
        {
            "parameters": {
                "conditions": {
                    "boolean": [
                        {
                            "value1": "={{$store.get(\"circuitOpen\") && Date.now() >= $store.get(\"circuitResumeAt\")}}",
                            "operation": "equals",
                            "value2": true
                        }
                    ]
                }
            },
            "name": "Check Circuit Status",
            "type": "n8n-nodes-base.if",
            "position": [
                6650,
                900
            ]
        },
        {
            "parameters": {
                "functionCode": "$store.set(\"circuitOpen\", false);\n$store.set(\"circuitResumeAt\", null);\nreturn [{}];"
            },
            "name": "Clear Circuit Flags",
            "type": "n8n-nodes-base.function",
            "position": [
                6850,
                900
            ]
        },
        {
            "parameters": {
                "content": "🔒 **Run-Lock Backup Plan**\n- If lock acquisition fails, implement exponential backoff with max 3 retries\n- After 3 failures, log error and exit gracefully\n- Consider distributed lock via Redis for multi-instance setups",
                "mode": "html",
                "height": 4,
                "width": 6
            },
            "name": "Run-Lock Sticky",
            "type": "n8n-nodes-base.stickyNote",
            "position": [
                250,
                100
            ]
        },
        {
            "parameters": {
                "content": "🔄 **Token Refresh Backup**\n- Store tokens in encrypted store\n- Auto-pause workflow on repeated failures\n- Alert admin if refresh fails 3x\n- Implement OAuth fallback flow if refresh token expires",
                "mode": "html",
                "height": 4,
                "width": 6
            },
            "name": "Auth Sticky",
            "type": "n8n-nodes-base.stickyNote",
            "position": [
                850,
                100
            ]
        },
        {
            "parameters": {
                "content": "📊 **Query Fallback Strategy**\n- Primary query: Strict filters\n- Fallback: Remove optional filters (location, company size)\n- If still zero results, log and exit\n- Schedule follow-up with broader parameters",
                "mode": "html",
                "height": 4,
                "width": 6
            },
            "name": "Query Fallback Sticky",
            "type": "n8n-nodes-base.stickyNote",
            "position": [
                1450,
                100
            ]
        },
        {
            "parameters": {
                "content": "🔄 **Pagination Resilience**\n- Handle token expiration mid-pagination\n- Store pagination state in workflow variables\n- Auto-resume from last good page after re-auth\n- Max 3 retries per page before circuit break",
                "mode": "html",
                "height": 4,
                "width": 6
            },
            "name": "Pagination Sticky",
            "type": "n8n-nodes-base.stickyNote",
            "position": [
                1850,
                500
            ]
        },
        {
            "parameters": {
                "content": "⚖️ **Scoring Fallback**\n- Default score 0 for unclassified\n- Manual review for score=1\n- Automated processing for score≥2\n- Regular review of scoring algorithm effectiveness",
                "mode": "html",
                "height": 4,
                "width": 6
            },
            "name": "Scoring Sticky",
            "type": "n8n-nodes-base.stickyNote",
            "position": [
                2450,
                500
            ]
        },
        {
            "parameters": {
                "content": "🔍 **Data Validation**\n- Strict regex for URLs and emails\n- Invalid records logged for review\n- Regular expression updates based on new patterns\n- Alert on high invalid rate (>5%)",
                "mode": "html",
                "height": 4,
                "width": 6
            },
            "name": "Validation Sticky",
            "type": "n8n-nodes-base.stickyNote",
            "position": [
                3050,
                600
            ]
        },
        {
            "parameters": {
                "content": "🔐 **Duplicate Check Safety**\n- Distributed lock mechanism\n- Timeout after 3 retries (90s total)\n- Automatic lock release on completion\n- Fallback to timestamp-based conflict resolution",
                "mode": "html",
                "height": 4,
                "width": 6
            },
            "name": "Locking Sticky",
            "type": "n8n-nodes-base.stickyNote",
            "position": [
                3250,
                700
            ]
        },
        {
            "parameters": {
                "content": "💾 **Batch Processing**\n- Buffer up to 100 records\n- Auto-spool to CSV on quota errors\n- Resume from last successful write\n- Daily reconciliation of spooled files",
                "mode": "html",
                "height": 4,
                "width": 6
            },
            "name": "Batch Processing Sticky",
            "type": "n8n-nodes-base.stickyNote",
            "position": [
                4450,
                800
            ]
        },
        {
            "parameters": {
                "content": "🚨 **Circuit Breaker Pattern**\n- Open circuit on repeated failures\n- 1-hour cooldown period\n- Auto-resume after cooldown\n- Alert on circuit open/close events",
                "mode": "html",
                "height": 4,
                "width": 6
            },
            "name": "Circuit Breaker Sticky",
            "type": "n8n-nodes-base.stickyNote",
            "position": [
                2050,
                300
            ]
        },
        {
            "parameters": {
                "content": "📊 **Run Summary**\n- Track all key metrics\n- Send alerts for anomalies\n- Log full run details\n- Weekly performance reports",
                "mode": "html",
                "height": 4,
                "width": 6
            },
            "name": "Summary Sticky",
            "type": "n8n-nodes-base.stickyNote",
            "position": [
                5650,
                700
            ]
        }
    ],
    "connections": {
        "Start / Trigger": {
            "main": [
                [
                    {
                        "node": "Acquire Run-Lock Check",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Acquire Run-Lock Check": {
            "main": [
                [
                    {
                        "node": "Health-Check (Resources & Quota)",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Health-Check (Resources & Quota)": {
            "main": [
                [
                    {
                        "node": "Refresh LinkedIn Token",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Refresh LinkedIn Token": {
            "main": [
                [
                    {
                        "node": "Test API Call",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Test API Call": {
            "main": [
                [
                    {
                        "node": "Build & Validate Query",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Build & Validate Query": {
            "main": [
                [
                    {
                        "node": "Simulate Query (Count-Only)",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Simulate Query (Count-Only)": {
            "main": [
                [
                    {
                        "node": "Check Zero Results",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Check Zero Results": {
            "main": [
                [
                    {
                        "node": "Log \"NO_DATA\" & Exit",
                        "type": "main",
                        "index": 0
                    }
                ],
                [
                    {
                        "node": "Fetch Leads – Initialise Pagination",
                        "type": "main",
                        "index": 1
                    }
                ]
            ]
        },
        "Fetch Leads – Initialise Pagination": {
            "main": [
                [
                    {
                        "node": "SplitInBatches (page-size 50)",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "SplitInBatches (page-size 50)": {
            "main": [
                [
                    {
                        "node": "HTTP Request – Get Page",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "HTTP Request – Get Page": {
            "main": [
                [
                    {
                        "node": "Pagination token OK?",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Pagination token OK?": {
            "main": [
                [
                    {
                        "node": "Stream Process Leads",
                        "type": "main",
                        "index": 0
                    }
                ],
                [
                    {
                        "node": "Refresh LinkedIn Token",
                        "type": "main",
                        "index": 1
                    }
                ]
            ]
        },
        "Stream Process Leads": {
            "main": [
                [
                    {
                        "node": "Score IT Relevance",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Score IT Relevance": {
            "main": [
                [
                    {
                        "node": "Score Decision",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Score Decision": {
            "main": [
                [
                    {
                        "node": "Extract & Enrich Fields",
                        "type": "main",
                        "index": 2
                    }
                ],
                [
                    {
                        "node": "Append to \"Review\" Tab",
                        "type": "main",
                        "index": 1
                    }
                ],
                [
                    {
                        "node": "SplitInBatches (page-size 50)",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Extract & Enrich Fields": {
            "main": [
                [
                    {
                        "node": "Validate Data",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Validate Data": {
            "main": [
                [
                    {
                        "node": "Log Invalid → \"Invalid Records\"",
                        "type": "main",
                        "index": 0
                    }
                ],
                [
                    {
                        "node": "Acquire Duplicate-Check Lock",
                        "type": "main",
                        "index": 1
                    }
                ]
            ]
        },
        "Acquire Duplicate-Check Lock": {
            "main": [
                [
                    {
                        "node": "Check Lock Status",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Check Lock Status": {
            "main": [
                [
                    {
                        "node": "Duplicate Check",
                        "type": "main",
                        "index": 0
                    }
                ],
                [
                    {
                        "node": "Wait-30s for Lock",
                        "type": "main",
                        "index": 1
                    }
                ]
            ]
        },
        "Wait-30s for Lock": {
            "main": [
                [
                    {
                        "node": "Increment Retry Counter",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Increment Retry Counter": {
            "main": [
                [
                    {
                        "node": "Acquire Duplicate-Check Lock",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Duplicate Check": {
            "main": [
                [
                    {
                        "node": "Check for Duplicate URL",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Check for Duplicate URL": {
            "main": [
                [
                    {
                        "node": "Is Duplicate?",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Is Duplicate?": {
            "main": [
                [
                    {
                        "node": "Update \"Last Seen\"",
                        "type": "main",
                        "index": 0
                    }
                ],
                [
                    {
                        "node": "Buffer Row for Batch Write",
                        "type": "main",
                        "index": 1
                    }
                ]
            ]
        },
        "Buffer Row for Batch Write": {
            "main": [
                [
                    {
                        "node": "Check Buffer Size",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Check Buffer Size": {
            "main": [
                [
                    {
                        "node": "Batch Append to \"IT Leads\"",
                        "type": "main",
                        "index": 0
                    }
                ],
                [
                    {
                        "node": "SplitInBatches (page-size 50)",
                        "type": "main",
                        "index": 1
                    }
                ]
            ]
        },
        "Batch Append to \"IT Leads\"": {
            "main": [
                [
                    {
                        "node": "Quota Error?",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Quota Error?": {
            "main": [
                [
                    {
                        "node": "Spool to CSV in Drive",
                        "type": "main",
                        "index": 0
                    }
                ],
                [
                    {
                        "node": "Release Duplicate-Check Lock",
                        "type": "main",
                        "index": 1
                    }
                ]
            ]
        },
        "Spool to CSV in Drive": {
            "main": [
                [
                    {
                        "node": "Release Duplicate-Check Lock",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Release Duplicate-Check Lock": {
            "main": [
                [
                    {
                        "node": "Send Summary (Slack)",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Send Summary (Slack)": {
            "main": [
                [
                    {
                        "node": "Log Run Metrics",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Log Run Metrics": {
            "main": [
                [
                    {
                        "node": "Cleanup",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Cleanup": {
            "main": [
                [
                    {
                        "node": "Mark Run \"COMPLETED\"",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Resume Check Cron": {
            "main": [
                [
                    {
                        "node": "Check Circuit Status",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Check Circuit Status": {
            "main": [
                [
                    {
                        "node": "Clear Circuit Flags",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        },
        "Clear Circuit Flags": {
            "main": [
                [
                    {
                        "node": "Start / Trigger",
                        "type": "main",
                        "index": 0
                    }
                ]
            ]
        }
    },
    "active": true,
    "settings": {
        "executionOrder": "v1"
    }
}
