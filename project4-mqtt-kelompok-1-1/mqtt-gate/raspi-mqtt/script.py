import json
import uuid


def on_message(client, userdata, msg):
    global waiting
    if msg.topic == "MASUK_RES":
        response = json.loads(msg.payload)
        response_id = response["id"]

        if response_id == userdata["id"]:
            status = response["payload"]["status"]
            userdata["status"] = status
            userdata["waiting"] = False

def req(client, idkartu, idgate):
    id = str(uuid.uuid4())
    payload = {
        "id" : id,
        "payload" : {
            "idkartu" : idkartu,
            "idgate" : idgate
        }
    }

    userdata = {
        "status" : None,
        "id" : id,
        "waiting" : True
    }

    message = json.dumps(payload)
    topic = "MASUK_REQ"
    client.publish(topic, message)
    client.user_data_set(userdata)
    client.on_message = on_message
    client.subscribe("MASUK_RES")
    while userdata["waiting"]:
        client.loop()

    return userdata["status"]


