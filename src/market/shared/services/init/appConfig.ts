function getRootObject() {
    let root: any = new Function('return this');
    return root();
}

export function get(entry?: string): any {
    let root = getRootObject();
    if (entry) {
        return root.APPCONFIG[entry];
    }
    return root.APPCONFIG;
}

export function set(entry: string, value: any) {
    let root = getRootObject();
    root.APPCONFIG[entry] = value;
}

export function setConfigs(configs: any) {
    let root = getRootObject();
    for (let entry in configs) {
      if (configs.hasOwnProperty(entry)) {
          root.APPCONFIG[entry] = configs[entry];
      }
    }
}

export let getAppConfig = get;

export function unload() {
    let root = getRootObject();
    root.APPCONFIG = null;
}

export function init(configs?: any) {
    let root = getRootObject();
    root.APPCONFIG = {};
    root.getAppConfig = get;
    if (configs) {
        setConfigs(configs);
    }
}
