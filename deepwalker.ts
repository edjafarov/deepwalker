
type Deepwalker = {
  get: Function
}
type DeepwalkerResult = InstanceResult & {
  toValues: Function
}

class InstanceResult {

  result: object;

  constructor(result: object) {
    this.result = result;
  }

  toValue = function (this: any, path: any) {
    return path ? this?._result[0]?.value[path] : this?.result[0]?.value;
  }
  filter = function (this: any, filterFn: Function) {
    return this.setResult(this.result.filter(filterFn))
  }
  sort = function (this: any, sortFn: Function) {
    this.result.sort(sortFn)
    return this;
  }
  pick = function (this: any, array: Array<any>) {
    this.result = this.result.map((el: any) => {
      return {
        ...el,
        value: Object.fromEntries(
          Object.entries(el.value)
            .filter(([key]) => array.includes(key))
        )
      }
    })
    return this;
  }
  flatten = function (this: any, array: any = []) {
    this.result = this.result.reduce((result: any, el: any) => {

      const arrayOfValues = Object.keys(el.value).filter(key => array.includes(key)).map((key) => {

        return {
          dimensions: el.dimensions.concat(key), value: {
            ...Object.fromEntries(
              Object.entries(el.value)
                .filter(([key]) => !array.includes(key))
            ),
            value: el.value[key]
          }
        }
      })
      return result.concat(arrayOfValues);
    }, []);
    return this;
  }
  concat = function (this: any, instance: any) {
    this.result = this.result.concat(instance.result);
    return this;
  }
  slice = function (this: any, number: any) {
    this.result = this.result.slice(0, number)
    return this;
  }
  toValues = function (this: any) {
    return this.result.map((r: any) => r.value);
  }
  toString = function (this: any, transformer: any) {
    if (!this.result || this.result.length == 0) return '';
    return transformer(createResultsObject(this.result))
  }
  convertEach = function (this: any, converter: any) {
    if (!this.result || this.result.length == 0) return [];
    return this.result.map(converter);
  }
  haveResults = function (this: any) {
    if (!this.result || this.result.length == 0) return false;
    return true;
  }
  toMap = function (this: any, path: any) {
    return this.result.reduce((res: any, r: any, i: any) => {
      let deepResult = res;
      r.dimensions.forEach((dim: any, i: any) => {
        if (!deepResult[dim] && i !== (r.dimensions.length - 1)) {
          deepResult[dim] = {};
        }
        if (i === (r.dimensions.length - 1)) deepResult[dim] = path ? r.value[path] : r.value;
        deepResult = deepResult[dim];
      })
      return res;
    }, {});
  }
  setResult = function (this: any, result: any) {
    this.result = result;
    return this;
  }
}

export function deepwalker(object: any): Deepwalker {
  const instance = {
    _value: object,
    _result: null,
    get: function (queryPath: string): DeepwalkerResult {
      return new InstanceResult(walker(queryPath.split("."), object));
    },
    setResult: function (result: object) {
      return new InstanceResult(result);
    }

  };

  return instance;
}


function createResultsObject(results: any) {
  const newResultsObject = [...results] as any;
  newResultsObject.getOne = (dims: any) => {
    return (results.find((result: any) => !result.dimensions.filter((d: any, i: any) => d !== dims[i]).length) || {}).value
  }
  return newResultsObject
}


type DeepResult = {
  dimensions: Array<string>,
  value: any
}

function walker(pathArray: Array<string>, object: any, result?: Array<DeepResult>, i: number = 0): Array<DeepResult> {
  if (result && pathArray.length == 0) {
    result[i].value = object;
    return result;
  }
  if (!result) result = [{ dimensions: [], value: undefined }];
  const step = pathArray.shift();
  if (step === "*") {
    if (typeof object !== 'object') return result;
    const baseDimensions = [...result[i].dimensions];
    result.splice(i, 1);
    Object.keys(object).forEach((key: string, j) => {
      const newResults = { dimensions: [...baseDimensions], value: undefined }
      newResults.dimensions.push(key);
      let resultIndex;
      if (result) {
        resultIndex = result.length;
        result[resultIndex] = newResults;
      }
      return walker([...pathArray], object[key], result, resultIndex);
    })
    return result.filter(filterUndefineds);
  }

  return walker(pathArray, object[step || ''], result, i).filter(filterUndefineds);;
}

function filterUndefineds(res: DeepResult) {
  return res.value !== undefined;
}
