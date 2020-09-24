const targetMap = new WeakMap()
const depsMap = new Map()
let activeEffect = null
function effect(eff) {
    activeEffect = eff
    activeEffect()
    activeEffect = null
}

let product = reactive({ price: 5, quantity: 2 })
let total = 0
let salePrice = 0
effect(() => {
    console.log('=> Total effect')
    total = product.price * product.quantity
    console.log('# new total ')
    console.log(`-> ${total}\n`)
})
effect(() => {
    console.log('=> salePrice effect')
    salePrice = product.price * 0.9
    console.log('# new salePrice')
    console.log(`-> ${salePrice}\n`)
})

function track(target, key) {
    if (activeEffect) {

        let depsMap = targetMap.get(target)
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()))
        }

        let dep = depsMap.get(key)

        if (!dep) {
            depsMap.set(key, (dep = new Set()))
        }

        dep.add(activeEffect)
    }
}

function trigger(target, key) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        return
    }

    let dep = depsMap.get(key)
    if (dep) {
        dep.forEach(effect => effect())
    }
}

function reactive(target) {
    const handler = {
        get(target, key, reciever) {
            track(target, key)
            console.log(`Get: ${key}.`)
            return Reflect.get(target, key, reciever)
        },
        set(target, key, value, reciever) {
            let oldValue = target[key]
            let result = Reflect.set(target, key, value, reciever)
            if (result && oldValue != value) {
                console.log(`Set: ${key} -> ${value}`)
                trigger(target, key)
            }
            return result
        }
    }
    return new Proxy(target, handler)
}




product.quantity = 18
product.price = 15
