---
title: People
permalink: /people/
---

{% assign people_sorted = site.people | sort: 'joined' %}
{% assign role_array = "pi|postdoc|gradstudent|researchstaff|visiting|others|ug" | split: "|" %}

{% for role in role_array %}

{% assign people_in_role = people_sorted | where: 'position', role %}

<!-- Skip section if there's nobody -->
{% if people_in_role.size == 0 %}
  {% continue %}
{% endif %}

<div class="pos_header">
{% if role == 'postdoc' %}
<h3>Postdoctoral Fellows</h3>
 {% elsif role == 'pi' %}
<h3>Principal Investigator</h3>
 {% elsif role == 'gradstudent' %}
<h3>Graduate Students</h3>
 {% elsif role == 'researchstaff' %}
<h3>Research Staff</h3>
 {% elsif role == 'visiting' %}
<h3>Visiting Scholars</h3>
 {% elsif role == 'others' %}
<h3>Student Collaborators</h3>
 {% elsif role == 'ug' %}
<h3>Undergraduate Students</h3>
{% endif %}
</div>

<div class="content list people">
  {% for profile in people_sorted %}
    {% if profile.position contains role %}
      <div class="list-item-people">
        <p class="list-post-title">
          {% if profile.avatar %}
            <a href="{{ site.baseurl }}{{ profile.url }}"><img class="profile-thumbnail" src="{{site.baseurl}}/images/people/{{profile.avatar}}"></a>
          {% else %}
            <a href="{{ site.baseurl }}{{ profile.url }}"><img class="profile-thumbnail" src="http://evansheline.com/wp-content/uploads/2011/02/facebook-Storm-Trooper.jpg"></a>
          {% endif %} 
          <a class="name" href="{{ site.baseurl }}{{ profile.url }}" style="font-weight: bold;">{{ profile.name }}</a><br>
          <!-- <a class="scholar" href="https://scholar.google.com/citations?user={{ profile.scholar }}&hl="  style="font-size: smaller;">Google Scholar</a> -->
        </p>
      </div>    
    {% endif %}
  {% endfor %}
</div>
<hr>

{% endfor %}

<!-- Alumni Section After All Other Roles -->
{% assign alumni = people_sorted | where: 'position', 'alumni' %}
{% if alumni.size > 0 %}

<!-- <div class="pos_header"> -->
<h3>Alumni</h3>
<!-- </div> -->


| Who are they  |First position after CRΔL| Publications/Outcomes |
| :------------- |:-------------| :-----------|
| [Rahul Maligi](https://www.linkedin.com/in/rahul-maligi/) |MS at UIUC &rarr; Amazon | [RA-L 2023](https://ieeexplore.ieee.org/document/10093969)|
| [Zayne Sprague](https://zaynesprague.com/) | PhD at UT Austin &rarr; PhD at NYU| [AAAI 2024](https://ojs.aaai.org/index.php/AAAI/article/view/30562)|
| [Arya Anantula](https://www.linkedin.com/in/arya-anantula/) |MS at Georgia Tech | [MRS 2025](https://ieeexplore.ieee.org/abstract/document/11357249), [RA-L 2023](https://ieeexplore.ieee.org/document/10093969)|
| [Siddharth Lakkoju](https://www.linkedin.com/in/siddharthlakkoju/) |Space X | [L4DC 2025](https://livenet-uva.github.io/)|
| [Srikar Guoru](https://www.linkedin.com/in/srikar-gouru-090244181) | MS at CMU | [L4DC 2025](https://livenet-uva.github.io/)|
| [Vagul Mahadevan](https://www.linkedin.com/in/vagul-mahadevan) |  Metron | [MRS 2025](https://gamechat-uva.github.io/)|
| [Aleesha Khurram](https://www.linkedin.com/in/aleesha-khurram-4bb262262/) | MS at Oxford | [Under Review at IROS26](https://arxiv.org/pdf/2511.12755)|
| [Himesh Ahuja](https://www.linkedin.com/in/himesh-ahuja/)| Currently at UVA | [Ingrassia Family Grant of $2,000](https://echols.as.virginia.edu/scholarships-echols-scholars)|

<!-- Add more rows as needed -->
{% endif %}
<hr>

<!-- ### Active Collaborators

Here are some cool people in fields that interest us. **note:** This list is in no way complete. We have a lot of collaborators -- if you've collaborated with us and want a link here, let us know!

**UVA:**
- [Shangtong Zhang - Dept of Computer Science](https://shangtongzhang.github.io/)
- [Zezhou Cheng - Dept of Computer Science](https://sites.google.com/site/zezhoucheng/)
- [Jonathan L. Goodall - Dept of Civil and Environmental Engineering](https://engineering.virginia.edu/faculty/jonathan-l-goodall)

**GMU:**
- [Xuesu Xiao - Dept of Computer Science](https://cs.gmu.edu/~xiao/)

**UPenn:**
- [Rahul Mangharam - Dept of Electrical and Systems Engineering](https://www.seas.upenn.edu/~rahulm/)

**UC Berkeley:**
- [Negar Mehr - Dept of Mechanical Engineering](https://negarmehr.com/) -->