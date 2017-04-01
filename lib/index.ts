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

export function manager(options: ManagerOptions): Manager{
    return new Manager(options);
}
