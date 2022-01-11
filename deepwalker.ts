
type Deepwalker = {
  get: Function
}
type DeepwalkerResult = Deepwalker & {
  toValues: Function
}

export function deepwalker(object: any): Deepwalker {
  const instance = {
    _value: object,
    get: function (queryPath: string): DeepwalkerResult {
      return instanceResult.setResult(walker(queryPath.split("."), object));
    }

  };
  const instanceResult = {
    _result: null,
    ...instance,
    toValue: function () {
      return instanceResult?._result[0]?.value;
    },
    filter: function (filterFn) {
      return instanceResult.setResult(instanceResult._result.call.filter(instanceResult, filterFn))
    },
    sort: function (sortFn) {
      return instanceResult.setResult(instanceResult._result.call.filter(instanceResult, sortFn))
    },
    toValues: function () {
      return instanceResult._result.map(r => r.value);
    },
    toMap: function () {
      return instanceResult._result.reduce((res, r, i) => {
        let deepResult = res;
        r.dimensions.forEach((dim, i) => {
          if (!deepResult[dim] && i !== (r.dimensions.length - 1)) {
            deepResult[dim] = {};
          }
          if (i === (r.dimensions.length - 1)) deepResult[dim] = r.value;
          deepResult = deepResult[dim];
        })
        return res;
      }, {});
    },
    setResult: function (result) {
      instanceResult._result = result;
      return instanceResult;
    }

  }
  return instance;
}

type DeepResult = {
  dimensions: Array<string>,
  value: any
}

function walker(pathArray: Array<string>, object: any, result?: Array<DeepResult>, i: number = 0): Array<DeepResult> {
  if (pathArray.length == 0) {
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
      const resultIndex = result.length;
      result[resultIndex] = newResults;
      return walker([...pathArray], object[key], result, resultIndex);
    })
    return result.filter(filterUndefineds);
  }

  return walker(pathArray, object[step], result, i).filter(filterUndefineds);;
}

function filterUndefineds(res: DeepResult) {
  return res.value !== undefined;
}
