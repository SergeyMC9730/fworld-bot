function wait_ms_prom(ms = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);  
    });
}

module.exports = {
    wait_ms_prom: wait_ms_prom
}