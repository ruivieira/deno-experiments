import { Base, Container } from "../../deno-boxes/core.ts";
import { Composer, Service } from "../../deno-boxes/compose.ts";

const KAFKA_TAG = "0.19.0-kafka-2.5.0";
const KAKFA_FROM = "strimzi/kafka";
const KAKFA_BASE = new Base(KAKFA_FROM, KAFKA_TAG);

const zookeeper = new Container(KAKFA_BASE);
zookeeper.cmd(
  "sh",
  "-c",
  "bin/zookeeper-server-start.sh config/zookeeper.properties",
)
  .port(2181);

const zkService = new Service("zookeeper", zookeeper);
zkService.env("LOG_DIR", "/tmp/");

const kafka = new Container(KAKFA_BASE);
kafka.cmd(
  "sh",
  "-c",
  "bin/kafka-server-start.sh config/server.properties --override listeners=$${KAFKA_LISTENERS} --override advertised.listeners=$${KAFKA_ADVERTISED_LISTENERS} --override zookeeper.connect=$${KAFKA_ZOOKEEPER_CONNECT}",
);
kafka.port(9092);
const kafkaService = new Service("kafka", kafka);

const ksEnv = {
  LOG_DIR: "/tmp/logs",
  KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://0.0.0.0:9092",
  KAFKA_LISTENERS: "PLAINTEXT://0.0.0.0:9092",
  KAFKA_ZOOKEEPER_CONNECT: "zookeeper:2181",
};

kafkaService.envs(ksEnv).depends_on(zkService);

const composer = new Composer();

composer.add(zkService).add(kafkaService);

console.log(composer.render());
