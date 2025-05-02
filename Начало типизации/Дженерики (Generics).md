Дженерик — условные тип, который может определять значения других. Считайте, что дженерик — это аргумент для типа, например, как в функции. Рассмотрим пару примеров. К слову, я уже упоминал, когда говорил о типах массива, первые пример будет на нём:
```ts
const array: Array<string> = [
	"Hello", ",", " ", "World", "!"
];
```
Разберём тип `Array<string>`, а точнее то, что написано в стрелках. Кстати, воспринимайте стрелки как скобки в функциях, а всё то, что написано в них как аргументы, Вам, возможно, будет проще так воспринимать дженерики. Итак, тип `string` в типе `Array` говорит нам, что он расширяет тип `Array`, делая из него массив строк. Также можно написать `Array<Array<string>>`, тогда это будет вложенный массив строк в массиве. То есть `[["string"]]`.
# Дженерики в своих типах

Желательно знать про [создание своих типов](./Создание%20своих%20типов.md).
Итак, дженерик — это что-то в роде аргумента в функции, но только как тип. Рассмотрим простые примеры.
```ts
// Пример 1
type Foo<T> = T;

const foo: Foo<string> = "123";
// type foo: string

// Пример 2
type Foo<T> = { [key: string]: T };

const foo: Foo<Array<string>> = {
	bar1: ["asd", "qwe"],
	bar2: []
};
// type foo: object
```
В повседневном использовании, как я думаю, не должно возникнуть вопросов по их использованию, однако это простые примеры, давайте перейдём к чему-нибудь посложнее.
```ts
type Members = "FOCKUSTY"|"Valentin Bird"|"Adelya"|"beyz1k"|"Omonillo";
type Foo<T extends string, K> = Map<T, K>;

const foo: Foo<Members, string> = new Map([
	["FOCKUSTY", "ceo"],
	["Valentin Bird", "team leader"],
	["Adelya", "manager"],
	["beyz1k", "promoter"],
	["Omonillo", "promoter"]
]);
```
Итак... Думаю, что некоторым тут итак всё ясно, но давайте я лучше поясню.
Первым делом мы создали тип `Members`, который содержит всех (год 2025) участников команды [LAF](https://laf-info.netlify.app), — запомним и оставим на попозже.
Далее мы создали тип `Foo`, который принимает два дженерика: `T` и `K` (стандартные названия для дженерик-типов, однако я рекомендую называть нормально, так `T` стал бы `Key`, а `K` — `Value`). Далее, мы засунули эти дженерики в дженерики `Map` соответственно по их расположению, делайте так всегда, чтобы было проще понимать, с чем работает разработчик.
Вернёмся к первому типу. Итак, так мы говорим, что ключи Map не могут содержать другого значения, а сами значения Map могут быть (перешли к `Foo<Members, string`>, говорим про `string`) только строками.
Однако, что это за `extends` такой? — Так мы говорим, что дженерик `T` может быть только строковым литералом.
Рассмотрим ещё другие примеры из реальной разработки на примере [KakDela](https://github.com/Lazy-And-Focused/KakDela):
```ts
type IResponse<T, K=null> = ({
  successed: true

  data: T
  error: null
} | {
  successed: false

  data: K
  error: string
});
export interface IUser {
  id: string;
  username: string;
  
  created_at: string;
  avatar_url?: string;
  global_name?: string;
};

const response1: IResponse<IUser> = {
  successed: true,
  data: {
    id: "1",
    username: "FOCKUSTY",
    created_at: new Date().toISOString(),
  },
  error: null
};
const response2: IResponse<IUser> = {
  successed: false,
  data: null,
  error: "user not found"
};
  
// Свойство "response2" объявлено, но его значение не было прочитано.
// Тип "{ successed: false; data: { id: string; username: string; created_at: string; }; error: null; }" не может быть назначен для типа "IResponse<IUser, null>".
// Типы свойства "data" несовместимы.
// Тип "{ id: string; username: string; created_at: string; }" не может быть назначен для типа "null".
const errorResponse: IResponse<IUser> = {
  successed: false,
  data: {
    id: "1",
    username: "FOCKUSTY",
    created_at: new Date().toISOString(),
  },
  error: null
};
```
Что ж... Начнём с самого начала.
`IResponse<T, K=null>`, где `k=null` — это дефолтное значение, прям как в функциях.
А дальше мы говорим, что когда `successed` будет равен `true`, то у нас другие значения будут принимать: `data: T, error: null`. А когда `successed` будет равен `false`, то уже `data: K, error: string`.
На самом деле так очень удобно описывать типы, ибо может появится такая ситуация, что `successed` равен `true`, а `data` будет `T | K`. Прошлым же способ мы явно указываем при каких значения `successed` какие значения будут принимать соответствующие типы. Такое можно использовать не только при `boolean`-типах, а при любых. Например, когда мы явно указываем тип объекта. Однако это уже не про дженерики.
Пожалуй начальная информация на этом всё.