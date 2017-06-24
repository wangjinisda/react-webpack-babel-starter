
declare module "*.dll" {
    const content: any;
    export default content;
}

declare interface ObjectConstructor {
    assign(...objects: Object[]): Object;
}