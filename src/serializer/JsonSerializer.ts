import { Serializer } from "./Serializer";

export class JsonSerializer<T> implements Serializer<T> {
  serialize = (obj: Object): T => JSON.parse(JSON.stringify(obj));
  deserialize = (clazz: T): Object => JSON.stringify(clazz);
}
