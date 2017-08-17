import { UwiAdmissionsStudentPortalPage } from './app.po';

describe('uwi-admissions-student-portal App', () => {
  let page: UwiAdmissionsStudentPortalPage;

  beforeEach(() => {
    page = new UwiAdmissionsStudentPortalPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
