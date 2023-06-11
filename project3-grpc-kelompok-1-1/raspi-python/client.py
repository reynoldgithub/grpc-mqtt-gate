import grpc
import gate_pb2
import gate_pb2_grpc
import logging

def run():
    print("Will try to greet world ...")
    with grpc.insecure_channel('localhost:3002') as channel:
        stub = gate_pb2_grpc.GateServiceStub(channel)
        response = stub.masuk(gate_pb2.MasukRequest(idkartu=1212121212, idgate=5))
    print("Response :" , response.status)


if __name__ == '__main__':
    logging.basicConfig()
    run()
