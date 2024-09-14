class Query extends EventTarget {
    constructor(url = "", { retry, tags } = { retry: 0, tags: [] }) {
        super();
        this.url = url;
        this.retried = 0;
        this.retry = retry;
        this.tags = tags;
    }

    call() {
        fetch(this.url)
            .then(async val => {
                if (!val.ok) {
                    return this.#failure(val);
                }

                try {
                    const value = await val.json();
                    return this.#success(value);
                } catch (err) {
                    return this.#failure(err);
                }
            })
            .catch(err => this.#failure(err))
            .finally(() => this.#clean());
    }

    #clean() {
        this.dispatchEvent(new CustomEvent("done", { }));
    }

    #success(value) {
        this.dispatchEvent(new CustomEvent("success", { value }));
    }

    #failure(value) {
        if (this.retried < this.retry) {
            this.retried++;
            this.call(this.url);
        }

        this.dispatchEvent(new CustomEvent("failure", { value }));
    }
}


q = new Query('https://dog-api.kinduff.com/api/facts', {
    tags: ['facts']
});

q.addEventListener('done', (val) => console.log('doneeee'));
q.addEventListener('success', (val) => console.log(val));
q.addEventListener('failure', (val) => console.error(val));


q.call();


class Mutation extends EventTarget {
    constructor(url = "", { retry, payload } = { retry: 0, payload: {} }) {
        super();
        this.url = url;
        this.retried = 0;
        this.retry = retry;
        this.payload = payload;
    }

    call() {
        fetch({ url: this.url, body: JSON.stringify(this.payload), method: "POST" })
            .then(async val => {
                if (!val.ok) {
                    return this.#failure(val);
                }

                try {
                    const value = await val.json();
                    return this.#success(value);
                } catch (err) {
                    return this.#failure(err);
                }
            })
            .catch(err => this.#failure(err))
            .finally(() => this.#clean());
    }

    #clean() {
        this.dispatchEvent(new CustomEvent("done", {}));
    }

    #success(value) {
        this.dispatchEvent(new CustomEvent("success", { value }));
    }

    #failure(value) {
        if (this.retried < this.retry) {
            this.retried++;
            this.call(this.url);
        }

        this.dispatchEvent(new CustomEvent("failure", { value }));
    }
}
