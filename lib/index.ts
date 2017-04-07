import {
    User,
    UserConfig,
    Manager,
    ManagerOptions,
} from './main';

export {
    User,
    UserConfig,
    Manager,
    ManagerOptions,
};

export function manager<T extends object>(options: ManagerOptions): Manager<T>{
    return new Manager(options);
}
