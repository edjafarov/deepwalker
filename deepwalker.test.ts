import { deepwalker } from './deepwalker'
const obj = {
  compare: {
    mobile: {
      facebook: {
        difference: 1
      },
      twitter: {
        difference: 4
      },
      linkedin: {
        difference: 7
      },
      instagram: {
        difference: 13
      },
      youtube: {
        difference: 40
      }
    },
    desktop: {
      facebook: {
        difference: 10
      },
      twitter: {
        difference: 22
      },
      linkedin: {
        difference: 7
      },
      instagram: {
        difference: 3
      },
      youtube: {
        difference: 1
      }
    }
  }
};
describe('deepwalker', () => {
  describe('should get data from object ', () => {
    test('by simple path', () => {
      expect(
        deepwalker(obj).get('compare.mobile.facebook.difference').toValue()
      ).toMatchSnapshot()
    })
    test('by mask', () => {
      expect(
        deepwalker(obj).get('compare.mobile.*.difference').toValues()
      ).toMatchSnapshot()
    })
  })
})
describe('deepwalker', () => {
  describe('should get data from object ', () => {
    test('by mask to hash', () => {
      expect(
        deepwalker(obj).get('compare.mobile.*.difference').toMap()
      ).toMatchSnapshot()
    })

    test('by mask to nested hash', () => {
      expect(
        deepwalker(obj).get('compare.*.*.difference').toMap()
      ).toMatchSnapshot()
    })
  })
})
/*
fetch(`
  compare {
    mobile {
      channel {
        sessions
        conversion rate
        avg basket
      }
    }
  }
`)
session/%
cr
// each('compare.mobile.*.difference', (v)=>{})
// get('compare.mobile.facebook.difference') > 10
filter('compare.*.*.session_share', essential_share)
function byValue(el){
  el.value
  el.dim1
  el.dim2
}

deepwalker(obj).get('compare.*.*.difference').sort(byValue).filter(essential_share).map(action)

*/