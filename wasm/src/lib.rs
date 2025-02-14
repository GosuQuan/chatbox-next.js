use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    let mut a = 0;
    let mut b = 1;
    for _ in 1..n {
        let temp = a + b;
        a = b;
        b = temp;
    }
    b
}
pub fn fibonacci2(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    fibonacci2(n - 1) + fibonacci2(n - 2);
}

#[wasm_bindgen]
pub fn batch_fibonacci(count: u32, n: u32) -> Box<[u32]> {
    let mut results = Vec::with_capacity(count as usize);
    for _ in 0..count {
        results.push(fibonacci(n));
    }
    results.into_boxed_slice()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fibonacci() {
        assert_eq!(fibonacci(0), 0);
        assert_eq!(fibonacci(1), 1);
        assert_eq!(fibonacci(2), 1);
        assert_eq!(fibonacci(3), 2);
        assert_eq!(fibonacci(4), 3);
        assert_eq!(fibonacci(5), 5);
    }
}
