export function updateDivs(
        identifiers: string[],
        callback: CallableFunction,
        observe: boolean = true,
        subtree: boolean | boolean[] = false
): (MutationObserver | null)[] | null {

        let observers: (MutationObserver | null)[] = [];
        let cache: HTMLElement[] = [];

        function createObserver(element: HTMLElement, subtree: boolean): MutationObserver | null {
                if (!element) {
                        console.error("Cannot create observer with null element.");
                        return null;
                }

                const options: MutationObserverInit = {
                        childList: true,
                        attributes: false,
                        subtree: subtree
                };

                const observer = new MutationObserver((): void => {
                        // Avoid recursion
                        observer.disconnect();

                        callback(cache);

                        observer.observe(element.parentElement!, options);
                });

                // Observe the parent
                observer.observe(element.parentElement!, options);
                return observer;
        }

        function waitForDivs(): Promise<HTMLElement[]> {
                return new Promise((resolve, reject) => {
                        const timeout = 5000; // ms
                        const interval = 100; // ms

                        let elements: (HTMLElement | null)[] = new Array(identifiers.length).fill(null);
                        let checksRemaining = identifiers.length;
                        const startTime = Date.now();

                        const checkExist = (index: number, identifier: string): void => {
                                const element = document.querySelector(identifier);
                                if (element && element !== undefined) {
                                        elements[index] = element as HTMLElement;

                                        if (--checksRemaining === 0)
                                                resolve(elements.filter((el) => el !== null) as HTMLElement[]);
                                } else if (Date.now() - startTime > timeout) {
                                        reject(`Timeout: Element(s) [${identifiers.join(', ')}] not found within ${timeout}ms`);
                                } else {
                                        setTimeout(() => checkExist(index, identifier), interval);
                                }
                        };

                        identifiers.forEach((identifier, index) => {
                                checkExist(index, identifier);
                        })
                });
        }

        waitForDivs().then((elements: HTMLElement[]) => {
                cache = elements;
                callback(elements);

                if (observe)
                        elements.forEach((element, index): void => {
                                observers.push(createObserver(element, Array.isArray(subtree) ? subtree[index] : subtree));
                        })
        }).catch((error: Error) => {
                console.error(error);
        });

        return observers;
}