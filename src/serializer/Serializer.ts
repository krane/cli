export interface Serializer<T> {
  serialize(obj: Object): T;
  deserialize(clazz: T): Object;
}
