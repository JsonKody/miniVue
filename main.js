const targetMap = new WeakMap()
let activeEffect = null


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
            let result = Reflect.get(target, key, reciever)
            track(target, key)
            return result
        },
        set(target, key, value, reciever) {
            let oldValue = target[key]
            let result = Reflect.set(target, key, value, reciever)
            if (result && oldValue != value) {
                trigger(target, key)
            }
            return result
        }
    }
    return new Proxy(target, handler)
}


function ref(raw) {
    const r = {
        get value() {
            track(r, 'value')
            return raw
        },
        set value(newVal) {
            raw = newVal
            trigger(r, 'value')
        },
    }
    return r
}


function effect(eff) {
    activeEffect = eff
    activeEffect()
    activeEffect = null
}

let product = reactive({ price: 5, quantity: 2 })
let salePrice = ref(0)
let total = 0

effect(() => {
    salePrice.value = product.price * 0.9
})

effect(() => {
    total = salePrice.value * product.quantity
})


console.log(
    `Before updated quantity total (should be 9) = ${total} salePrice (should be 4.5) = ${salePrice.value}`
)
product.quantity = 3
console.log(
    `After updated quantity total (should be 13.5) = ${total} salePrice (should be 4.5) = ${salePrice.value}`
)
product.price = 10
console.log(
    `After updated price total (should be 27) = ${total} salePrice (should be 9) = ${salePrice.value}`
)
