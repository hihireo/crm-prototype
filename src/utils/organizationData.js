// 조직도 데이터 관리 시스템

// 전체 조직 트리 데이터
export const organizationTreeData = [
  {
    id: 1,
    type: "team",
    name: "회사 전체",
    description: "전체 조직",
    leaderName: "대표이사",
    leaderPosition: "대표이사",
    email: "ceo@company.com",
    phone: "010-0000-0001",
    children: [
      {
        id: 2,
        type: "team",
        name: "영업본부",
        description: "영업 총괄",
        leaderName: "이본부장",
        leaderPosition: "본부장",
        email: "lee.sales@company.com",
        phone: "010-1000-0001",
        children: [
          {
            id: 20,
            type: "team",
            name: "영업1지점",
            description: "마곡지점",
            leaderName: "박팀장",
            leaderPosition: "팀장",
            email: "park.sales1@company.com",
            phone: "010-1100-0001",
            children: [
              {
                id: 4,
                type: "team",
                name: "신규고객팀",
                description: "신규 고객 개발",
                leaderName: "최리더",
                leaderPosition: "팀리더",
                email: "choi.newcustomer@company.com",
                phone: "010-1110-0001",
                children: [
                  {
                    id: 5,
                    type: "member",
                    name: "김신규",
                    position: "주임",
                    email: "kim.new@company.com",
                    phone: "010-1234-5678",
                    photo:
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    id: 6,
                    type: "member",
                    name: "이개발",
                    position: "사원",
                    email: "lee.dev@company.com",
                    phone: "010-2345-6789",
                  },
                ],
              },
              {
                id: 7,
                type: "team",
                name: "온라인영업팀",
                description: "온라인 채널 관리",
                leaderName: "정온라인",
                leaderPosition: "팀리더",
                email: "jung.online@company.com",
                phone: "010-1120-0001",
                children: [
                  {
                    id: 8,
                    type: "member",
                    name: "박온라인",
                    position: "사원",
                    email: "park.online@company.com",
                    phone: "010-3456-7890",
                  },
                  {
                    id: 9,
                    type: "member",
                    name: "김디지털",
                    position: "주임",
                    email: "kim.digital@company.com",
                    phone: "010-4567-8901",
                  },
                ],
              },
            ],
          },
          {
            id: 21,
            type: "team",
            name: "영업2지점",
            description: "강남지점",
            leaderName: "최지점장",
            leaderPosition: "지점장",
            email: "choi.sales2@company.com",
            phone: "010-1200-0001",
            children: [
              {
                id: 22,
                type: "member",
                name: "서강남",
                position: "팀원",
                email: "seo.gangnam@company.com",
                phone: "010-5678-9012",
              },
              {
                id: 23,
                type: "member",
                name: "한영업",
                position: "주임",
                email: "han.sales@company.com",
                phone: "010-6789-0123",
              },
            ],
          },
        ],
      },
      {
        id: 3,
        type: "team",
        name: "기술본부",
        description: "기술 개발 총괄",
        leaderName: "김본부장",
        leaderPosition: "본부장",
        email: "kim.tech@company.com",
        phone: "010-2000-0001",
        children: [
          {
            id: 30,
            type: "team",
            name: "개발1팀",
            description: "프론트엔드 개발",
            leaderName: "이팀장",
            leaderPosition: "팀장",
            email: "lee.dev1@company.com",
            phone: "010-2100-0001",
            children: [
              {
                id: 31,
                type: "member",
                name: "박프론트",
                position: "선임",
                email: "park.frontend@company.com",
                phone: "010-7890-1234",
                photo:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
              },
              {
                id: 32,
                type: "member",
                name: "김리액트",
                position: "사원",
                email: "kim.react@company.com",
                phone: "010-8901-2345",
              },
            ],
          },
          {
            id: 33,
            type: "team",
            name: "개발2팀",
            description: "백엔드 개발",
            leaderName: "박팀장",
            leaderPosition: "팀장",
            email: "park.dev2@company.com",
            phone: "010-2200-0001",
            children: [
              {
                id: 34,
                type: "member",
                name: "최백엔드",
                position: "선임",
                email: "choi.backend@company.com",
                phone: "010-9012-3456",
              },
              {
                id: 35,
                type: "team",
                name: "데이터팀",
                description: "데이터 분석",
                leaderName: "정데이터",
                leaderPosition: "팀리더",
                email: "jung.data@company.com",
                phone: "010-2210-0001",
                children: [
                  {
                    id: 36,
                    type: "member",
                    name: "이분석",
                    position: "사원",
                    email: "lee.analysis@company.com",
                    phone: "010-0123-4567",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 40,
        type: "team",
        name: "경영지원본부",
        description: "경영 지원",
        leaderName: "홍본부장",
        leaderPosition: "본부장",
        email: "hong.support@company.com",
        phone: "010-3000-0001",
        children: [
          {
            id: 41,
            type: "member",
            name: "김인사",
            position: "팀장",
            email: "kim.hr@company.com",
            phone: "010-1357-2468",
          },
          {
            id: 42,
            type: "member",
            name: "이회계",
            position: "주임",
            email: "lee.accounting@company.com",
            phone: "010-2468-1357",
          },
        ],
      },
    ],
  },
];

// 직원 ID로 직원 정보 찾기
export const findEmployeeById = (
  employeeId,
  treeData = organizationTreeData
) => {
  for (const node of treeData) {
    if (node.id === employeeId) {
      return node;
    }
    if (node.children) {
      const found = findEmployeeById(employeeId, node.children);
      if (found) return found;
    }
  }
  return null;
};

// 직원의 부모 노드 찾기
export const findParentNode = (employeeId, treeData = organizationTreeData) => {
  const findParent = (nodes, parentNode = null) => {
    for (const node of nodes) {
      if (node.id === employeeId) {
        return parentNode;
      }
      if (node.children) {
        const found = findParent(node.children, node);
        if (found !== null) return found;
      }
    }
    return null;
  };

  return findParent(treeData);
};

// 직원의 예하 직원들 찾기
export const getSubordinates = (
  employeeId,
  treeData = organizationTreeData
) => {
  const employee = findEmployeeById(employeeId, treeData);
  return employee?.children || [];
};

// 직원 정보를 모달에 맞게 변환
export const transformEmployeeForModal = (employee) => {
  if (!employee) return null;

  return {
    ...employee,
    displayName: employee.type === "team" ? employee.leaderName : employee.name,
    teamName: employee.type === "team" ? employee.name : null,
    email:
      employee.email ||
      `${(employee.name || employee.leaderName || "")
        .toLowerCase()
        .replace(/\s+/g, ".")}@company.com`,
    phone: employee.phone || "010-0000-0000",
  };
};

// 전체 직원 목록 (평면화)
export const getAllEmployees = (treeData = organizationTreeData) => {
  const employees = [];

  const traverse = (nodes) => {
    for (const node of nodes) {
      employees.push(transformEmployeeForModal(node));
      if (node.children) {
        traverse(node.children);
      }
    }
  };

  traverse(treeData);
  return employees;
};

// 직원 이름으로 검색
export const searchEmployeesByName = (
  searchTerm,
  treeData = organizationTreeData
) => {
  const allEmployees = getAllEmployees(treeData);
  return allEmployees.filter(
    (employee) =>
      (employee.name &&
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.leaderName &&
        employee.leaderName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.displayName &&
        employee.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
};

export default {
  organizationTreeData,
  findEmployeeById,
  findParentNode,
  getSubordinates,
  transformEmployeeForModal,
  getAllEmployees,
  searchEmployeesByName,
};
