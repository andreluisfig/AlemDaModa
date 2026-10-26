# AlémDaModa — Brechó Virtual

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**AlémDaModa** é um brechó virtual desenvolvido com HTML5, CSS3 e JavaScript, com catálogo de roupas, filtros por categoria, busca de produtos, sacola de compras e gerenciamento de itens. O projeto explora o consumo consciente e a reutilização de peças de roupa por meio de uma interface responsiva.

---

## Sobre o Projeto

Em um cenário de consumo acelerado, o **AlémDaModa** simula um e-commerce de brechó onde cada peça do catálogo é **única**: quando um item é colocado na sacola, ele fica reservado e sai do acervo; caso seja removido da sacola, retorna imediatamente ao acervo; e, ao finalizar a compra, é baixado definitivamente do catálogo.

A aplicação funciona no formato *Single Page Application* (SPA) utilizando apenas JavaScript puro, além de utilizar o `localStorage` do navegador para persistir sessões de login e alterações feitas pelo administrador no catálogo.

---

## Contas de Teste (Simulação)

Para testar os diferentes níveis de acesso na plataforma, clique no botão **Entrar** no topo da página e utilize uma das credenciais abaixo:

| Perfil | Usuário | Senha | Permissões |
| :--- | :--- | :--- | :--- |
| **Cliente** | `cliente` | `cliente123` | Navegar pelo acervo, filtrar, pesquisar e realizar compras na sacola. |
| **Administrador** | `admin` | `admin123` | Todas as funções de cliente + **Adicionar**, **Editar** e **Remover** peças do acervo. |

---

## Tecnologias Utilizadas

* **HTML5:** Estruturação semântica das seções, catálogo de produtos, formulários.
* **CSS3:** Layout responsivo com Flexbox.
* **JavaScript:**
  * Gerenciamento de estado da sacola, filtros e navegação entre telas.
  * Armazenamento local para sessão e persistência do catálogo.
