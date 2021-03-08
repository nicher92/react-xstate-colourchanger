export const commands = `

<grammar root="command">
   <rule id="command">
      <ruleref uri="#request"/>
      <tag>out.request = new Object(); 
      out=rules.request;
      out=rules.request;</tag>

 
   <rule id="request">
      <item repeat="0-1">
      <ruleref uri="#action_onOff"/>
      <ruleref uri="#object_onOff"/>
      <tag>out.action=rules.action_onOff; 
      out.object=rules.object_onOff;</tag>
     </item>

     <item repeat="0-1">
      <ruleref uri="#action_openClose"/>
      <ruleref uri="#object_openClose"/>
      <tag>out.action=rules.action_openClose; 
      out.object=rules.object_openClose;</tag>
      </item>
    
      <item repeat="0-1">
      <ruleref uri="#action_onOff2"/>
      <ruleref uri="#object_onOff2"/>
      <tag>out.action=rules.action_onOff2; 
      out.object=rules.object_onOff2;</tag>
     </item>

   </rule>


  <rule id="action_onOff">
   <item repeat = "0-">please</item>
     <one-of>
        <item> turn off<tag> out = "on"; </tag> </item>
        <item> turn on<tag> out = "off"; </tag> </item>
     </one-of>
   </rule>

      <rule id="action_onOff2">
   <item repeat = "0-">please</item>
     <one-of>
        <item> turn <tag> out = "on"; </tag> </item>
        <item> turn <tag> out = "off"; </tag> </item>
     </one-of>
   </rule>


   <rule id="object_onOff2">
     the
     <one-of>
        <item> light <tag> out = "light"; </tag></item>
        <item> heat <tag> out = "heat"; </tag></item>
        <item> A C <tag> out = 'air conditioning'; </tag></item>
        <item> air conditioning <tag> out = "air conditioning"; </tag></item>
     </one-of>
    off
   <item repeat = "0-">please</item>
   
   </rule>

   <rule id="object_onOff">
     the
     <one-of>
        <item> light <tag> out = "light"; </tag></item>
        <item> heat <tag> out = "heat"; </tag></item>
        <item> A C <tag> out = 'air conditioning'; </tag></item>
        <item> air conditioning <tag> out = "air conditioning"; </tag></item>
     </one-of>
   <item repeat = "0-">please</item>
   </rule>

  <rule id="action_openClose">
   <item repeat = "0-">please</item>
     <one-of>
        <item> close <tag> out = "close"; </tag> </item>
        <item> open <tag> out = "open"; </tag></item>
     </one-of>
   </rule>

   <rule id="object_openClose">
     the
     <one-of>
        <item> window <tag> out = "window"; </tag></item>
        <item> door <tag> out = "door"; </tag></item>
     </one-of>
   <item repeat = "0-">please</item>
   </rule>
   
</grammar>



`
