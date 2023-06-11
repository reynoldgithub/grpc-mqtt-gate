from script import req
import paho.mqtt.client as mqtt

broker = "localhost"
port = 1883

client = mqtt.Client()
client.connect(broker, port)
print("Client connect")

print(req(client, 1212121212, 5))
print(req(client, 1212121212, 5))
print(req(client, 1212121212, 5))
print(req(client, 1212121212, 5))
print(req(client, 1212121212, 5))

client.disconnect()
