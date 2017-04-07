import {
    User,
    UserConfig,
    UserData,
    Manager,
    ManagerOptions,
} from './main';

export {
    User,
    UserConfig,
    UserData,
    Manager,
    ManagerOptions,
};

export function manager<T extends object>(options: ManagerOptions): Manager<T>{
    return new Manager(options);
}
