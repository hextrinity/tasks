describe('Tasks Applicatin testing', () => {
  beforeEach(() => {
    cy.visit('https://tasks-nine-rho.vercel.app/active')
  })
  
  context(("Home page"), () => {

    it('Loads the Home Page and checks contents', () => {    
      cy.contains('Deleted Tasks').click()
      cy.url().should('include', '/deleted')

      cy.get("button").contains("Active Tasks").click();
      //cy.url().should('include', '/active')
      cy.location("pathname").should("equal", "/active")
      cy.get(".category-title").eq(0).contains("Urgent, Important")
      cy.get(".category-title").eq(1).contains("Urgent, Not Important")
      cy.get(".category-title").eq(2).contains("Not Urgent, Important")
      cy.get(".category-title").eq(3).contains("Not Urgent, Not Important")   
    })

  })

  context(("Forms testing"), () => {

    it('Fill and save the add form!', () => {    
      cy.get("[aria-label='Add Task']").eq(0).click()
      cy.get("[formcontrolname='name']").type('test name')
      cy.get("[formcontrolname='description']").type('test description')
      cy.get("[formcontrolname='dueDate']").type('6/23/2026')
      cy.get("button").contains("Save").click();

      cy.get("mat-card-title").contains("test name").should('exist')   
    })

    it('Unsuccessful fill and save the add form!', () => {    
      cy.get("[aria-label='Add Task']").eq(0).click()
      cy.get("[formcontrolname='name']").type(' ')
      cy.get("[formcontrolname='description']").type(' ')
      cy.get("[formcontrolname='dueDate']").type(' ')

      cy.get("[disabled='true']").contains("Save").should('exist')    
    })

    it('fill and Cancel the add form!', () => {    
      cy.get("[aria-label='Add Task']").eq(0).click()
      cy.get("[formcontrolname='name']").type('test name 2')
      cy.get("[formcontrolname='description']").type('test description 2')
      cy.get("[formcontrolname='dueDate']").type('6/23/2026')
      cy.get("button").contains("Cancel").click(); 

      cy.get("mat-card-title").contains("test name 2").should('not.exist') 
    })

  })


  
})