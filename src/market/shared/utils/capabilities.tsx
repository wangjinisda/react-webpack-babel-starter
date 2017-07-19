export interface ICapabilities {
    [id: string]: string[];
}

export const Capabilities: ICapabilities = {
    'Capability1' : ['CP_Office1', 'CP_Office2'],
    'Capability2' : ['CP_Office3', 'CP_Office2'],
    'Capability3' : ['CP_Office4', 'CP_Office2'],
    'Capability4' : [],
    'Capability5' : ['CP_Office2', 'CP_Office5'],
    'Capability6' : ['CP_Office2', 'CP_Office6'],
    'Capability7' : ['CP_Office2', 'CP_Office7'],
    'Capability8' : [],
    'Capability9' : [],
    'Capability10' : ['CP_Office2', 'CP_Office8'],
    'Capability11' : ['CP_Office9', 'CP_Office2']
};