import {
    User,
    UserConfig,
    Manager,
    ManagerOptions,
} from './main';

export {
    User,
    UserConfig,
};

export function manager(options: ManagerOptions): Manager{
    return new Manager(options);
}
